import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { SessionService } from '../sessions/session.service';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(
    email: string,
    password: string,
    username?: string,
  ): Promise<{ refreshToken: string; user: any }> {
    // 🔍 Vérifier si l'email existe déjà
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Cet email est déjà utilisé.');
    }

    // 🔐 Hashage du mot de passe avant stockage
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Création de l'utilisateur
    const user = await this.userService.createUser({
      email,
      username,
      password: hashedPassword,
      roles: [Role.USER], // Rôle par défaut
    });

    // 🔑 Génération d’un Refresh Token unique
    const refreshToken = this.jwtService.sign(
      { sub: user.id, roles: user.roles },
      {
        expiresIn: `${this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7)}d`,
      },
    );

    return { refreshToken, user };
  }

  /**
   * ✅ Vérifie l’email et le mot de passe, puis retourne un Refresh Token (sans session).
   */
  async authenticateWithPassword(
    email: string,
    password: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ refreshToken: string; user: any }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 🔐 Vérification du mot de passe hashé
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // ✅ Générer un Access Token et un nouveau Refresh Token
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // 🔄 Créer une nouvelle session avec le nouveau Refresh Token
    await this.sessionService.createSession(
      user,
      refreshToken,
      ipAddress,
      userAgent,
    );

    return { refreshToken, user };
  }

  /**
   * ✅ Vérifie un Refresh Token, crée une session et retourne un Access Token.
   */
  async authenticateWithRefreshToken(
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.validateRefreshToken(refreshToken);
    const userId = payload.sub;

    // 🔍 Vérifier si la session existe
    const existingSession = await this.sessionService.validateSession(
      userId,
      refreshToken,
      userAgent,
      ipAddress,
    );
    if (!existingSession)
      throw new UnauthorizedException('Refresh token invalide ou expiré.');

    const user = existingSession.user;

    // ✅ Générer un Access Token et un nouveau Refresh Token
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    // ❌ Supprimer l’ancienne session (rotation sécurisée)
    await this.sessionService.revokeSession(user.id, existingSession.id);

    // 🔄 Créer une nouvelle session avec le nouveau Refresh Token
    await this.sessionService.createSession(
      user,
      newRefreshToken,
      ipAddress,
      userAgent,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * ✅ Génère un Access Token et un Refresh Token.
   */
  async generateTokens(user: any) {
    const payload = { sub: user.id, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7)}d`,
    });

    return { accessToken, refreshToken };
  }

  /**
   * ✅ Décode et vérifie un Refresh Token.
   */
  async validateRefreshToken(refreshToken: string) {
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }
    return payload;
  }

  /**
   * ✅ Supprime une session spécifique lors de la déconnexion.
   */
  async logout(
    userId: number,
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
  ) {
    const session = await this.sessionService.validateSession(
      userId,
      refreshToken,
      userAgent,
      ipAddress,
    );
    if (session) {
      await this.sessionService.revokeSession(session.user.id, session.id);
    }
  }
}
