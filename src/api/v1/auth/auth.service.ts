import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valide un utilisateur lors de la connexion.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
  
    console.log('🔎 Utilisateur trouvé :', user); // Ajoute ce log
  
    if (user && (await bcrypt.compare(password, user.password))) {
      console.log('✅ Mot de passe correct');
      const { password, ...result } = user;
      return result;  
    }

    // Assure-toi que les rôles sont bien présents
    if (!user.roles || !Array.isArray(user.roles)) {
      console.log('⚠️ Problème : Pas de rôles définis pour cet utilisateur');
      return null;
    }
  
    console.log('❌ Utilisateur introuvable ou mauvais mot de passe');
    return null;
  }
  

  /**
   * Gère l'inscription d'un utilisateur.
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

    // Création de l'utilisateur
    const user = await this.userService.createUser({
      email,
      username,
      password: hashedPassword,
      roles: [Role.USER],
    });

    const payload = { username: user.username, sub: user.id, roles: user.roles };
    return {
      message: 'Inscription réussie',
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Gère la connexion d'un utilisateur.
   */
  async login(authDto: AuthDto) {
    const { email, password } = authDto;

    // Valide l'utilisateur
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    // ✅ Vérifie que user.roles est bien défini
    if (!user.roles) {
      throw new UnauthorizedException("L'utilisateur n'a pas de rôles attribués.");
    }

    // Génération du token JWT
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    return {
      message: 'Connexion réussie',
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
