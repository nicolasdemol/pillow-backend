import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import { UserService } from 'src/user/user.service';

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
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
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
    });

    // Génération du token JWT
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      access_token: token,
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

    // Génération du token JWT
    const payload = { username: user.username, sub: user.id };
    return {
      message: 'Connexion réussie',
      access_token: this.jwtService.sign(payload),
    };
  }
}
