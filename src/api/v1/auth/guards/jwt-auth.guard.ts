import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      this.logger.warn('❌ Accès refusé : Token invalide ou utilisateur non authentifié.');
      throw new UnauthorizedException('Token invalide ou utilisateur non authentifié.');
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    request.user = user as any; // ✅ Fixe req.user

    this.logger.log(`🔐 Utilisateur authentifié: ${JSON.stringify(request.user)}`); // 🔥 Log détaillé

    return user;
  }
}
