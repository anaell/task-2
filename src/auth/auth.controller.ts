import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { uuidv4 } from 'uuidv7';
import {
  GitHubCallBackDTO,
  LogoutEndpointDTO,
  RefreshApiDTO,
} from './auth.dto';
import crypto from 'crypto';

@Controller('auth')
@Throttle({ rate_limit: { limit: 10, ttl: 60000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @Redirect()
  async GitHubOAuth(@Res({ passthrough: true }) res: Response) {
    const state = uuidv4();
    // The un-hashed code
    const code_verifier = crypto.randomBytes(32).toString('base64url');

    // The hashed code (challenge)
    const code_challenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_APP_CLIENT_ID}&state=${state}&redirect_uri=${process.env.CALLBACK_URL1}&code_challenge_method=S256&code_challenge=${code_challenge}`;

    res.cookie('oauthState', state, {
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 3600000,
    });
    res.cookie('pkceVerifier', code_verifier, {
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 3600000,
    });

    return { url, statusCode: 307 };
  }

  @Get('github/callback')
  async GitHubCallback(
    @Query() query: GitHubCallBackDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const state = query.state;
    const stored_state = req.cookies['oauthState'];
    const pkce_verifier = req.cookies['pkceVerifier'];
    const github_code = query.code;

    const service_data = { state, stored_state, github_code, pkce_verifier };

    res.clearCookie('oauthState');
    res.clearCookie('pkceVerifier');
    const service_result =
      await this.authService.GitHubCallBackService_Web(service_data);

    const refresh_token = service_result.refresh_token;

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600000,
    });

    return { status: 'success', ...service_result };
  }

  @Post('refresh')
  async RefreshToken(
    @Body() body: RefreshApiDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refresh_token_from_body = body.refresh_token;
    const refresh_token_from_cookie = req.cookies['refresh_token'];
    const service_result = await this.authService.RefreshEndpointService(
      refresh_token_from_body,
      refresh_token_from_cookie,
    );

    res.clearCookie('refresh_token');
    res.cookie('refresh_token', service_result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600000,
    });

    return service_result;
  }

  @Post('logout')
  async Logout(
    @Body() body: LogoutEndpointDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh_token_from_body = body.refresh_token;
    const refresh_token_from_cookie = req.cookies['refresh_token'];

    const service_result = await this.authService.LogoutEndpointService(
      refresh_token_from_body,
      refresh_token_from_cookie,
    );

    res.clearCookie('refresh_token');

    return service_result;
  }
}
