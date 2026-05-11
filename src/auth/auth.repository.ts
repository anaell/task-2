import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role, Users } from 'generated/prisma/client';
import { UsersCreateInput, UsersUpdateInput } from 'generated/prisma/models';
// import { prisma } from 'lib/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}
  async CheckUserExists(githubId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { github_id: githubId },
      });
      return !!user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async CreateUser(user: UsersCreateInput) {
    try {
      const create_user = await this.prisma.users.create({ data: user });

      return create_user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async GetUser(githubId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { github_id: githubId },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async UpdateUserLoginStatus(github_id: string) {
    try {
      const updated_user = await this.prisma.users.update({
        where: { github_id },
        data: { last_login_at: new Date().toISOString() },
      });

      return updated_user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async UpdateUser_IsActive_Status(id: string) {
    try {
      return await this.prisma.users.update({
        where: { id },
        data: { is_active: false },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async GetUserByRole(role: Role) {
    try {
      return await this.prisma.users.findFirst({
        where: { role },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async GetUser_IsActive_Status(userid: string) {
    const status = await this.prisma.users.findUnique({
      where: { id: userid },
      select: { is_active: true },
    });
    return !!status?.is_active;
  }
}
