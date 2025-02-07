import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // ✅ Si aucune restriction de rôle, accès libre
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.warn('⚠️ Accès refusé : Aucun utilisateur trouvé.');
      throw new ForbiddenException('Vous devez être connecté pour accéder à cette ressource.');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      this.logger.warn(`⚠️ Problème avec les rôles de l'utilisateur : ${JSON.stringify(user)}`);
      throw new ForbiddenException("Vous n'avez pas les permissions nécessaires.");
    }

    this.logger.log(`🔍 Vérification des rôles : Requis = ${requiredRoles}, Utilisateur = ${user.roles}`);

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException("Vous n'avez pas les permissions nécessaires.");
    }

    return true;
  }
}
