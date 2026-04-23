import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AgeGroup,
  createUserType,
  fetchUsersWithOptionalFiltersType,
  Gender,
} from './app.type';
import { prisma } from '../lib/prisma';
import { Profile, User } from '../generated/prisma/client';
import { FetchProfilesDto } from './app.dto';

@Injectable()
export class DatabaseRepository {
  async createUser(data: createUserType): Promise<User> {
    try {
      const user = await prisma.user.create({ data });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkUserExists(name: string): Promise<boolean> {
    try {
      const userExists = await prisma.user.findFirst({ where: { name: name } });

      return !!userExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkUserExistsWithId(id: string): Promise<boolean> {
    try {
      const userExists = await prisma.user.findFirst({ where: { id } });

      return !!userExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUserByName(name: string): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({ where: { name } });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({ where: { id } });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async deleteUser(id: string) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUsersWithOptionalFilters(
    dto: FetchProfilesDto,
    // gender?: Gender,
    // country_id?: string,
    // age_group?: AgeGroup,
    // min_age?: number,
    // max_age?: number,
    // min_gender_probability?: number,
    // min_country_probability?: number,
  ): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
    try {
      // To build 'where' dynamically
      // const where: any = {};

      // if (gender) {
      //   where.gender = {
      //     equals: gender,
      //     mode: 'insensitive',
      //   };
      // }

      // if (country_id) {
      //   where.country_id = {
      //     equals: country_id,
      //     mode: 'insensitive',
      //   };
      // }

      // if (age_group) {
      //   where.age_group = {
      //     equals: age_group,
      //     mode: 'insensitive',
      //   };
      // }

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

      const orderBy = dto.sort_by
        ? {
            [dto.sort_by]: dto.order ?? 'asc',
          }
        : undefined;

      const page = dto.page ?? 1;
      const limit = Math.min(dto.limit ?? 10, 50);

      const skip = (page - 1) * limit;

      const [data, total] = await prisma.$transaction([
        prisma.profile.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.profile.count({ where }),
      ]);

      return { data, total, page, limit };
      // const profiles = await prisma.profile.findMany({
      //   where,
      // });

      // const profiles = await prisma.profile.findMany({
      //   where,
      //   orderBy: {},
      // });

      // return profiles;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }
}
