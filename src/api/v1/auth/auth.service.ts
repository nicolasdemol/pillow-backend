import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../users/user.service';
import { Role } from './enums/role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * ✅ Génère un Access Token et un Refresh Token
   */
  async generateTokens(user: any) {
    const payload = { sub: user.id, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY', '15m'),
    })
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7)}d`,
    });

    return { accessToken, refreshToken };
  }

  /**
   * 🔍 Vérifie si l'utilisateur existe et si son mot de passe est correct
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return user;
  }

  /**
   * 🔐 Gère la connexion et stocke le Refresh Token en base (hashé)
   */
  async login(authDto: AuthDto) {
    const { email, password } = authDto;
    const user = await this.validateUser(email, password);
    
    const { accessToken, refreshToken } = await this.generateTokens(user);
    
    // 🔒 Stocker le Refresh Token de manière sécurisée en base
    await this.userService.updateRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /**
   * 📩 Inscription d'un nouvel utilisateur
   */
  async signup(signupDto: SignupDto) {
    const { email, password, username } = signupDto;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé.');
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur avec un rôle par défaut
    const user = await this.userService.createUser({
      email,
      username,
      password: hashedPassword,
      roles: [Role.USER],
    });

    return {
      message: 'Inscription réussie',
      user,
    };
  }

  /**
   * 🔄 Rafraîchir l'Access Token à partir du Refresh Token
   */
  async refreshTokens(refreshToken: string) {
    try {
      // 🔍 Vérifier et extraire l'ID utilisateur depuis le Refresh Token
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;
  
      // 🔍 Recherche en base via l'ID utilisateur
      const user = await this.userService.findById(userId);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token invalide.');
      }
  
      // 🔐 Vérification du hash du Refresh Token stocké en base
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token invalide.');
      }

      // ❌ Invalider l'ancien Refresh Token
      await this.userService.removeRefreshToken(user.id);
  
      // ✅ Générer un nouveau Access Token et Refresh Token
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
  
      // 🔄 Mettre à jour le Refresh Token en base (hashé)
      await this.userService.updateRefreshToken(user.id, newRefreshToken);
  
      return { access_token: accessToken, refresh_token: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }
  }
  
  

  /**
   * 🚪 Déconnexion : suppression du Refresh Token stocké
   */
  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      await this.userService.removeRefreshToken(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Impossible de déconnecter.');
    }
  }
  
}
