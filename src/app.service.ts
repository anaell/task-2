import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AgeGroup,
  AgifyAPIResponseType,
  Gender,
  GenderizeAPIResponseType,
  NationalizeAPIResponseType,
  Order,
  ProcessPostRequestFunctionType,
  SortBy,
} from './app.type';
import { uuidv7 } from 'uuidv7';
import { DatabaseRepository } from './app.repository';
import { FetchProfilesDto, NaturalLanguageSearchQueryDto } from './app.dto';
import { parseSearchQuery } from './utils/queryparserfunction';

@Injectable()
export class AppService {
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async GenderizeRequestFunction(
    name: string,
  ): Promise<GenderizeAPIResponseType> {
    try {
      const genderize_response = await fetch(
        `https://api.genderize.io?name=${name}`,
      );

      if (!genderize_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const genderize_data: GenderizeAPIResponseType =
        await genderize_response.json();

      console.log(genderize_data);

      if (genderize_data.count === 0 || genderize_data.gender === null) {
        throw new BadGatewayException({
          status: '502',
          message: `Genderize returned an invalid response`,
        });
      }

      return genderize_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async AgifyRequestFunction(name: string): Promise<AgifyAPIResponseType> {
    try {
      const agify_response = await fetch(`https://api.agify.io?name=${name}`);

      if (!agify_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const agify_data: AgifyAPIResponseType = await agify_response.json();
      console.log(agify_data);

      if (agify_data.age === null) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      return agify_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async NationalizeRequestFunction(
    name: string,
  ): Promise<NationalizeAPIResponseType> {
    try {
      const nationalize_response = await fetch(
        `https://api.nationalize.io?name=${name}`,
      );

      if (!nationalize_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const nationalize_data: NationalizeAPIResponseType =
        await nationalize_response.json();

      console.log(nationalize_data);

      if (!nationalize_data.country[0]) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      return nationalize_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async ProcessPostRequestFunction(
    profileName: string,
  ): Promise<ProcessPostRequestFunctionType | any> {
    try {
      const name = profileName.toLowerCase();
      const userExists = await this.databaseRepository.checkUserExists(name);

      if (userExists) {
        const user = await this.databaseRepository.fetchUserByName(name);

        return {
          status: 'success',
          message: 'Profile already exists',
          data: user,
        };
      }

      const genderize_data: GenderizeAPIResponseType =
        await this.GenderizeRequestFunction(name);

      const agify_data: AgifyAPIResponseType =
        await this.AgifyRequestFunction(name);

      const nationalize_data: NationalizeAPIResponseType =
        await this.NationalizeRequestFunction(name);

      // To classify using the age
      function classifyAge(age) {
        switch (true) {
          case age >= 0 && age <= 12:
            return 'child';
          case age >= 13 && age <= 19:
            return 'teenager';
          case age >= 20 && age <= 59:
            return 'adult';
          case age >= 60:
            return 'senior';
          default:
            return 'unknown';
        }
      }

      const age_group = classifyAge(agify_data.age);

      const country_sorted = nationalize_data.country.sort((a, b) => {
        return a.probability - b.probability;
      });
      const country = country_sorted[country_sorted.length - 1];

      const processed_data = {
        id: uuidv7(),
        name,
        gender: genderize_data.gender,
        gender_probability: genderize_data.probability,
        sample_size: genderize_data.count,
        age: agify_data.age,
        age_group,
        country_id: country.country_id,
        country_probability: country.probability,
      };

      const created_user_data =
        await this.databaseRepository.createUser(processed_data);

      return { status: 'success', data: { ...created_user_data } };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async ProcessGetProfileUsingId(id: string) {
    try {
      const checkUserExists =
        await this.databaseRepository.checkUserExistsWithId(id);
      if (!checkUserExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      const user = await this.databaseRepository.fetchUserById(id);

      return { status: 'success', data: user };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async DeleteProfileFunction(id: string) {
    try {
      const checkUserExists =
        await this.databaseRepository.checkUserExistsWithId(id);
      if (!checkUserExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      await this.databaseRepository.deleteUser(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  // The code below is an adjustment for task-2
  async GetAllProfileWithOptionalFilters(
    params: FetchProfilesDto,
    // gender?: Gender,
    // country_id?: string,
    // age_group?: AgeGroup,
    // min_age?: number,
    // max_age?: number,
    // min_gender_probability?: number,
    // min_country_probability?: number,
    // sort_by?: SortBy,
    // order?: Order,
    // page?: number,
    // limit?: number,
  ) {
    try {
      const profiles =
        await this.databaseRepository.fetchUsersWithOptionalFilters(
          params,
          // params.gender,
          // params.country_id?.toLowerCase(),
          // params.age_group,
          // params.min_age,
          // params.max_age,
          // params.min_gender_probability,
          // params.min_country_probability,
        );

      return {
        status: 'success',
        page: profiles.page,
        limit: profiles.limit,
        total: profiles.total,
        data: profiles.data,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async NaturalLanguageQueryService(q: string, page?: number, limit?: number) {
    try {
      console.log('Service speaking here. Natural language query received.');

      const received_query = q.toLowerCase().trim();

      const parsed_query = parseSearchQuery(received_query, limit, page);

      if (!parsed_query) {
        throw new BadRequestException({
          status: 'error',
          message: 'Unable to interpret query',
        });
      }

      console.log('About to request to the DB.');

      const data =
        await this.databaseRepository.fetchUsersWithOptionalFilters(
          parsed_query,
        );

      return {
        status: 'success',
        page: data.page,
        limit: data.limit,
        total: data.total,
        data: data.data,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }
}
