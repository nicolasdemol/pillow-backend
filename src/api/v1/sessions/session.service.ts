import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Session } from './session.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * ✅ Créer une session sécurisée avec expiration
   */
  async createSession(
    user: User,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 🔥 Expire dans 7 jours

    const session = this.sessionRepository.create({
      user,
      refreshTokenHash: hashedToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * ✅ Valider une session avec le Refresh Token et les informations de connexion
   */
  async validateSession(
    userId: number,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    console.log(userId, refreshToken, ipAddress, userAgent);
    // ✅ Vérifie que les sessions sont bien trouvées
    const sessions = await this.sessionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    console.log('🔍 Sessions trouvées :', sessions); // ✅ Debugging

    if (!sessions.length) {
      throw new UnauthorizedException(
        'Aucune session trouvée pour cet appareil',
      );
    }

    // 🔄 Vérifier le Refresh Token parmi les sessions valides
    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
        // Vérifier si la session est expirée
        if (session.expiresAt && new Date() > session.expiresAt) {
          await this.sessionRepository.delete(session.id);
          throw new UnauthorizedException(
            'Session expirée. Veuillez vous reconnecter.',
          );
        }
        return session;
      }
    }

    throw new UnauthorizedException('Session invalide ou suspecte');
  }

  /**
   * ✅ Récupérer toutes les sessions actives d'un utilisateur
   */
  async getUserSessions(userId: number) {
    return this.sessionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ✅ Révoquer une session spécifique
   */
  async revokeSession(userId: number, sessionId: number) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    await this.sessionRepository.delete(session.id);
  }

  /**
   * ✅ Révoquer toutes les sessions sauf celle en cours
   */
  async revokeAllSessionsExceptCurrent(
    userId: number,
    currentSessionId: number,
  ) {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('userId = :userId AND id != :currentSessionId', {
        userId,
        currentSessionId,
      })
      .execute();
  }

  /**
   * ✅ Révoquer toutes les sessions d'un utilisateur (déconnexion complète)
   */
  async revokeAllSessions(userId: number) {
    await this.sessionRepository.delete({ user: { id: userId } });
  }
}
