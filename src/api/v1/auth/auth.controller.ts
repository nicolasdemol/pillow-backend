import { Controller, Post, Body, Response, Logger, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';

@Controller({ path: 'auth', version: '1' }) // Définit v1
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly refreshTokenCookiePath: string;
  private readonly refreshTokenMaxAge: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService, // ✅ Injection du ConfigService
  ) {
    this.refreshTokenCookiePath = this.configService.get<string>('REFRESH_TOKEN_COOKIE_PATH', '/v1/auth');
    this.refreshTokenMaxAge = this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7) * 24 * 60 * 60 * 1000;
  }

  /**
   * Endpoint pour l'inscription de l'utilisateur.
   */
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    this.logger.log('Tentative d’inscription', { email: signupDto.email });
    return this.authService.signup(signupDto);
  }

  /**
   * Endpoint pour l'authentification de l'utilisateur.
   */
  @Post('login')
  async login(@Body() authDto: AuthDto, @Response() res) {
    this.logger.log('Tentative de connexion', authDto.email);

    const { access_token, refresh_token } = await this.authService.login(authDto);

    // 🔥 Stocker le Refresh Token dans un Cookie HTTPOnly
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,  // Empêche l'accès au JavaScript (protection XSS)
      secure: false,    // Seulement en HTTPS (important en prod)
      sameSite: 'strict', // Protection contre CSRF
      path: this.refreshTokenCookiePath,
      maxAge: this.refreshTokenMaxAge,
    });

    return res.json({ access_token });
  }

  /**
   * 🔄 Rafraîchissement du token à partir du Refresh Token stocké dans le Cookie
   */
  @Post('refresh')
  async refreshToken(@Request() req, @Response() res) {
    this.logger.log('Tentative de refresh_token');
    const refreshToken = req.cookies?.refresh_token;
    console.log(refreshToken)

    if (!refreshToken) {
      throw new UnauthorizedException('Aucun Refresh Token trouvé');
    }

    const { access_token, refresh_token: newRefreshToken } = await this.authService.refreshTokens(refreshToken);

    // Met à jour le Refresh Token stocké en Cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
      maxAge: this.refreshTokenMaxAge,
    });

    return res.json({ access_token });
  }

  @Post('logout')
  async logout(@Request() req, @Response() res) {
    this.logger.log('Tentative de déconnexion');
    const refreshToken = req.cookies?.refresh_token;
    console.log(refreshToken)

    if (!refreshToken) {
      return res.json({ message: 'Déjà déconnecté' });
    }

    // 🔄 Supprime le Refresh Token de l’utilisateur en base
    await this.authService.logout(refreshToken);

    // ❌ Supprime le cookie côté client
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false, // ❗ Doit être `true` en prod avec HTTPS
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
    });

    return res.json({ message: 'Déconnexion réussie' });
  }

}
