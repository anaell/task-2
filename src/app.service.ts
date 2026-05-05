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
import {
  ExportToCSVDto,
  FetchProfilesDto,
  NaturalLanguageSearchQueryDto,
} from './app.dto';
import { parseSearchQuery } from './utils/queryparserfunction';
import { getCountryNameFromId } from './utils/countrycodemapper';
import { Response } from 'express';
import { format } from '@fast-csv/format';

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

  async ProcessProfilePostRequestFunction(
    profileName: string,
  ): Promise<ProcessPostRequestFunctionType | any> {
    try {
      const name = profileName.toLowerCase();
      const profileExists =
        await this.databaseRepository.checkProfileExists(name);

      if (profileExists) {
        const profile = await this.databaseRepository.fetchProfileByName(name);

        return {
          status: 'success',
          message: 'Profile already exists',
          data: profile,
        };
      }

      const genderize_data: GenderizeAPIResponseType =
        await this.GenderizeRequestFunction(name);

      const agify_data: AgifyAPIResponseType =
        await this.AgifyRequestFunction(name);

      const nationalize_data: NationalizeAPIResponseType =
        await this.NationalizeRequestFunction(name);

      console.log(nationalize_data);

      // To classify using the age
      function classifyAge(age) {
        switch (true) {
          case age >= 0 && age <= 12:
            return AgeGroup.child;
          case age >= 13 && age <= 19:
            return AgeGroup.teenager;
          case age >= 20 && age <= 59:
            return AgeGroup.adult;
          default:
            return AgeGroup.senior;
        }
      }

      const age_group = classifyAge(agify_data.age);

      const country_sorted = nationalize_data.country.sort((a, b) => {
        // The sort is according to the probability. So the highest probability will be last
        return a.probability - b.probability;
      });
      // To extract the country with the highest probability
      const country = country_sorted[country_sorted.length - 1];
      const country_name = getCountryNameFromId(country.country_id);

      const processed_data = {
        id: uuidv7(),
        name,
        gender: genderize_data.gender,
        gender_probability: genderize_data.probability,
        // Make an adjustment here for the task 3. Comment out sample_size
        // sample_size: genderize_data.count,
        age: agify_data.age,
        age_group,
        country_id: country.country_id,
        // Add country_name here for the task3
        // This is to make it the same with the seed given in task2.
        country_name,
        country_probability: country.probability,
      };

      const created_profile_data =
        await this.databaseRepository.createProfile(processed_data);

      return { status: 'success', data: { ...created_profile_data } };
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
      const checkProfileExists =
        await this.databaseRepository.checkProfileExistsWithId(id);
      if (!checkProfileExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      const profile = await this.databaseRepository.fetchProfileById(id);

      return { status: 'success', data: profile };
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
      const checkProfileExists =
        await this.databaseRepository.checkProfileExistsWithId(id);
      if (!checkProfileExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      await this.databaseRepository.deleteProfile(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  // The code below is an adjustment for task-2
  async GetAllProfileWithOptionalFilters(params: FetchProfilesDto) {
    try {
      const profiles =
        await this.databaseRepository.fetchProfileWithOptionalFilters(params);

      const total_pages = Math.ceil(profiles.total / profiles.limit);

      // Links to the next, prev and current page in the pagination
      const base_api_url = '/api/profiles';
      const link_to_self = `${base_api_url}?page=${profiles.page}&limit=${profiles.limit}`;
      const link_to_next =
        profiles.page === total_pages
          ? null
          : `${base_api_url}?page=${profiles.page + 1}&limit=${profiles.limit}`;
      const link_to_prev =
        profiles.page <= 1
          ? null
          : `${base_api_url}?page=${profiles.page - 1}&limit=${profiles.limit}`;

      return {
        status: 'success',
        page: profiles.page,
        limit: profiles.limit,
        total: profiles.total,
        total_pages,
        links: {
          self: link_to_self,
          next: link_to_next,
          prev: link_to_prev,
        },
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
        await this.databaseRepository.fetchProfileWithOptionalFilters(
          parsed_query,
        );

      const total_pages = Math.ceil(data.total / data.limit);

      // Links to the next, prev and current page in the pagination
      const base_api_url = '/api/profiles';
      const link_to_self = `${base_api_url}?page=${data.page}&limit=${data.limit}`;
      const link_to_next =
        data.page === total_pages
          ? null
          : `${base_api_url}?page=${data.page + 1}&limit=${data.limit}`;
      const link_to_prev =
        data.page <= 1
          ? null
          : `${base_api_url}?page=${data.page - 1}&limit=${data.limit}`;

      return {
        status: 'success',
        page: data.page,
        limit: data.limit,
        total: data.total,
        total_pages,
        links: {
          self: link_to_self,
          next: link_to_next,
          prev: link_to_prev,
        },
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

  async HandleExportService(query: ExportToCSVDto, res: Response) {
    try {
      if (query.format && query.format !== 'csv') {
        throw new BadRequestException({
          status: 'error',
          message: 'Only csv format is supported currently!',
        });
      }

      // Setting the headers manually and using the 'Response' Object from Express because this necessitates it.
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=profiles_${Date.now()}.csv`,
      );

      const CSV_HEADERS = [
        'id',
        'name',
        'gender',
        'gender_probability',
        'age',
        'age_group',
        'country_id',
        'country_name',
        'country_probability',
        'created_at',
      ];

      const streamCSV = format({ headers: CSV_HEADERS, delimiter: ',' });

      streamCSV.pipe(res);

      // Used a generator function to mock the streaming from db straight to user.
      // The below is for consuming the generator function
      for await (const batch of this.databaseRepository.fetchProfileForCSV_Streaming(
        query,
      )) {
        for (const profile of batch) {
          streamCSV.write(profile);
        }
      }

      streamCSV.end();
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }
}
