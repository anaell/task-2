import { InternalServerErrorException } from '@nestjs/common';
import { Users } from 'generated/prisma/client';
import { prisma } from 'lib/prisma';

export class AuthRepository {
  async CheckUserExists(githubId: string) {
    try {
      const user = await prisma.users.findUnique({
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

  async CreateUser(user: Users) {
    try {
      const create_user = await prisma.users.create({ data: user });

      return create_user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }
}
