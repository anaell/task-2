import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
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
