import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  email: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;

  @Exclude()
  password: string;

  @Exclude()
  isEmailVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}
