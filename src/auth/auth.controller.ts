import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle({ rate_limit: { limit: 10, ttl: 60000 } })
export class AuthController {
  @Get('github')
  async GitHubOAuth() {}

  @Get('github/callback')
  async GitHubCallback() {}

  @Post('refresh')
  async RefreshToken(@Body('refresh_token') refresh_token: string) {}

  @Post('logout')
  async Logout() {}
}
