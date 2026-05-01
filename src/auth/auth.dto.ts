import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshApiDTO {
  @IsNotEmpty({ message: 'Refresh Token Required' })
  @IsString({ message: 'Refresh Token must be a string' })
  refresh_token!: string;
}
