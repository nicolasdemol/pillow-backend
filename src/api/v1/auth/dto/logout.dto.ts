import { IsNumber } from 'class-validator';

export class LogoutDto {
  @IsNumber({}, { message: "L'ID de l'utilisateur est requis" })
  userId: number;
}
