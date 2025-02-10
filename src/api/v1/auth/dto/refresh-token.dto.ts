import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Le Refresh Token est requis' })
  refreshToken: string;
}
