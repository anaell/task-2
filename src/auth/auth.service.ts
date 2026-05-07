import {
  BadGatewayException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
// import { uuidv4 } from 'uuidv7';
import { GitHubCallBackService_DataType } from './auth.types';
import { AuthRepository } from './auth.repository';
import { uuidv7 } from 'uuidv7';
import { JwtTokenUtilityFunction } from 'src/auth/auth.jwt.service';
import { CacheRepository } from './auth.cache.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtToken: JwtTokenUtilityFunction,
    private readonly authRepository: AuthRepository,
    private readonly cacheRepository: CacheRepository,
  ) {}

  // The below is the for the web flow of github authentication
  async GitHubCallBackService_Web(data: GitHubCallBackService_DataType) {
    try {
      if (!data.stored_state || data.state !== data.stored_state) {
        // redirect user to the dashboard -- include this

        throw new UnauthorizedException();
      }

      const github_req_body = {
        client_id: process.env.GITHUB_APP_CLIENT_ID,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
        code: data.github_code,
        code_verifier: data.pkce_verifier,
        redirect_uri: process.env.CALLBACK_URL1,
      };

      const github_request = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(github_req_body),
        },
      );

      if (!github_request.ok) {
        const text = await github_request.text();
        throw new BadGatewayException();
      }

      const github_req_data = await github_request.json();

      const github_access_token: string = github_req_data.access_token;

      const jwt_tokens =
        await this.GitHubReq_Fetch_Create_IssueTokens(github_access_token);

      return { ...jwt_tokens };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  // The below is to fetch the user details from github, create the user if not existing and then issue the tokens
  async GitHubReq_Fetch_Create_IssueTokens(github_access_token) {
    try {
      const user = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${github_access_token}`,
          'X-GitHub-Api-Version': '2026-03-10',
        },
      });

      const data = await user.json();

      const user_exists = this.authRepository.CheckUserExists(data.id);

      const create_user_object = {
        id: uuidv7(),
        github_id: data.id,
        username: data.login,
        email: data.email,
        avatar_url: data.avatar_url,
        is_active: true,
        // last_login: new Date().toISOString(),
      };

      const created_user = !user_exists
        ? await this.authRepository.CreateUser(create_user_object)
        : await this.authRepository.UpdateUserLoginStatus(data.id);

      const access_token = await this.jwtToken.CreateAccessToken(created_user);
      const refresh_token =
        await this.jwtToken.CreateRefreshToken(created_user);

      // Cache the refresh token
      await this.cacheRepository.CacheRefreshToken(
        created_user.id,
        refresh_token,
      );

      const tokens = { access_token, refresh_token };

      return tokens;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async RefreshEndpointService(
    refresh_token_from_body: string,
    refresh_token_from_cookie: string,
  ) {
    try {
      if (refresh_token_from_body !== refresh_token_from_cookie) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Unauthorized to carry this action',
        });
      }

      const verify_old_refresh_token =
        await this.jwtToken.Parse_VerifyRefreshToken(refresh_token_from_body);

      const cached_refresh_token =
        await this.cacheRepository.RetrieveRefreshTokenFromCache(
          verify_old_refresh_token.id,
        );

      if (cached_refresh_token !== refresh_token_from_body) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Unauthorized to carry this action',
        });
      }

      const new_refresh_token = await this.jwtToken.CreateRefreshToken(
        verify_old_refresh_token,
      );

      await this.cacheRepository.DeleteRefreshTokenFromCache(
        verify_old_refresh_token.id,
      );

      await this.cacheRepository.CacheRefreshToken(
        verify_old_refresh_token.id,
        new_refresh_token,
      );

      const new_access_token = await this.jwtToken.CreateAccessToken(
        verify_old_refresh_token,
      );
      return {
        status: 'success',
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async LogoutEndpointService(
    refresh_token_from_body: string,
    refresh_token_from_cookie: string,
  ) {
    try {
      if (refresh_token_from_body !== refresh_token_from_cookie) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Unauthorized to carry this action',
        });
      }

      const parsed_jwt_body = await this.jwtToken.Parse_VerifyRefreshToken(
        refresh_token_from_body,
      );

      const cached_refresh_token =
        await this.cacheRepository.RetrieveRefreshTokenFromCache(
          parsed_jwt_body.id,
        );

      if (cached_refresh_token !== refresh_token_from_body) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Unauthorized to carry this action',
        });
      }

      const user_id = parsed_jwt_body.id;
      await this.cacheRepository.DeleteRefreshTokenFromCache(user_id);

      await this.authRepository.UpdateUser_IsActive_Status(user_id);

      return { status: 'success', message: 'Logged Out successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }
}
