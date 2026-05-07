import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createProfileType } from './app.type';
// import { prisma } from '../lib/prisma';
import { Prisma, Profile } from '../generated/prisma/client';
import { FetchProfilesDto } from './app.dto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class DatabaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(data: createProfileType): Promise<Profile> {
    try {
      const profile = await this.prisma.profile.create({ data });

      return profile;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkProfileExists(name: string): Promise<boolean> {
    try {
      const profileExists = await this.prisma.profile.findFirst({
        where: { name: name },
      });

      return !!profileExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkProfileExistsWithId(id: string): Promise<boolean> {
    try {
      const profileExists = await this.prisma.profile.findFirst({
        where: { id },
      });

      return !!profileExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchProfileByName(name: string): Promise<Profile | null> {
    try {
      const profile = await this.prisma.profile.findFirst({ where: { name } });

      return profile;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchProfileById(id: string): Promise<Profile | null> {
    try {
      const profile = await this.prisma.profile.findFirst({ where: { id } });

      return profile;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async deleteProfile(id: string) {
    try {
      await this.prisma.profile.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  buildWhere(dto: FetchProfilesDto) {
    const where: any = {};

    if (dto.gender) where.gender = dto.gender;
    if (dto.country_id)
      where.country_id = { equals: dto.country_id, mode: 'insensitive' };
    if (dto.age_group) where.age_group = dto.age_group;

    if (dto.min_age || dto.max_age) {
      where.age = {
        gte: dto.min_age,
        lte: dto.max_age,
      };
    }

    if (dto.min_gender_probability) {
      where.gender_probability = { gte: dto.min_gender_probability };
    }

    if (dto.min_country_probability) {
      where.country_probability = { gte: dto.min_country_probability };
    }

    return where;
  }

  async fetchProfileWithOptionalFilters(
    dto: FetchProfilesDto,
  ): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
    try {
      const where = this.buildWhere(dto);

      const orderBy = dto.sort_by
        ? {
            [dto.sort_by]: dto.order ?? 'asc',
          }
        : undefined;

      const page = dto.page ?? 1;
      const limit = Math.min(dto.limit ?? 10, 50);

      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.profile.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.profile.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async *fetchProfileForCSV_Streaming(dto: FetchProfilesDto, batchSize = 100) {
    try {
      // This is to build the where object dynamically. We need to do this because the user can provide any combination of filters, so we need to build the where object based on the provided filters. This is the same logic as in the fetchProfileWithOptionalFilters function, but we need to do it here as well because we are fetching the profiles in batches and we need to apply the same filters to each batch.
      const where = this.buildWhere(dto);

      // To ensure consistent and no missing records, when using 'cursor' we need to order by a unique field (To prevent duplicate or missing records when using cursor). If the user does not specify a sort_by, we will order by 'id' by default.
      const orderBy: Prisma.ProfileOrderByWithRelationInput = dto.sort_by
        ? // [dto.sort_by] is how computed property names work in JavaScript.
          { [dto.sort_by]: (dto.order ?? 'asc') as Prisma.SortOrder }
        : { id: 'asc' }; // important fallback to ensure that the order is consistent for yield batching so that duplicate or missing records don't occur across batches when the user doesn't specify a sort_by.

      let cursor: string | undefined = undefined;

      while (true) {
        const batch = await this.prisma.profile.findMany({
          where,
          orderBy,
          take: batchSize,
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
          }),
        });

        // To break out of the loop when there are no more records to fetch
        if (batch.length === 0) break;

        // Yield the current batch of profiles to the caller (the service in this case)
        yield batch;

        cursor = batch[batch.length - 1].id;
      }
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }
}
