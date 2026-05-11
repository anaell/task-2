import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshApiDTO {
  @IsNotEmpty({ message: 'Refresh Token Required' })
  @IsString({ message: 'Refresh Token must be a string' })
  refresh_token!: string;
}

export class GitHubCallBackDTO {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsOptional()
  @IsString()
  code_verifier?: string;
}

export class LogoutEndpointDTO {
  @IsString({ message: 'refresh_token invalid (token must be a string)' })
  @IsNotEmpty({ message: 'refresh_token is empty (input token value).' })
  refresh_token!: string;
}

export class GitHubCliDTO {
  @IsString()
  code!: string;

  @IsString()
  state!: string;

  @IsString()
  code_verifier!: string;
}
