import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async createSession(user: User, refreshToken: string, ip: string, userAgent: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const session = this.sessionRepository.create({ user, refreshTokenHash: hashedToken, ip, userAgent });
    return this.sessionRepository.save(session);
  }

  async validateSession(userId: number, refreshToken: string, ip: string, userAgent: string) {
    const session = await this.sessionRepository.findOne({ where: { user: { id: userId }, ip, userAgent } });
    if (!session || !(await bcrypt.compare(refreshToken, session.refreshTokenHash))) {
      throw new UnauthorizedException('Session invalide ou suspecte');
    }
    return session;
  }

  async revokeSession(userId: number, sessionId: number) {
    await this.sessionRepository.delete({ id: sessionId, user: { id: userId } });
  }

  async revokeAllSessions(userId: number) {
    await this.sessionRepository.delete({ user: { id: userId } });
  }
}
