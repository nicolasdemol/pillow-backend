// 📂 src/user/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  avatarUrl?: string;
}
