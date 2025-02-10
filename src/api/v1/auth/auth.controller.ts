import {
  Controller,
  Post,
  Body,
  Response,
  Logger,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly refreshTokenCookiePath: string;
  private readonly refreshTokenMaxAge: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenCookiePath = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_PATH',
      '/v1/auth',
    );
    this.refreshTokenMaxAge =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7) *
      24 *
      60 *
      60 *
      1000;
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Response() res) {
    this.logger.log(`Nouvelle inscription pour ${signupDto.email}`);

    const { refreshToken, user } = await this.authService.registerUser(
      signupDto.email,
      signupDto.password,
      signupDto.username,
    );

    // 🔄 Stocker le Refresh Token dans un Cookie HTTPOnly
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, // ❗ `true` en prod
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
      maxAge: this.refreshTokenMaxAge,
    });

    return res.json({
      status: 'success',
      message: 'Inscription réussie',
      data: { user },
    });
  }

  /**
   * ✅ Authentification par mot de passe (retourne un Refresh Token).
   */
  @Post('login')
  async login(@Request() req, @Body() authDto: AuthDto, @Response() res) {
    this.logger.log(`Tentative de connexion pour ${authDto.email}`);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip;

    const { refreshToken, user } =
      await this.authService.authenticateWithPassword(
        authDto.email,
        authDto.password,
        userAgent,
        ipAddress,
      );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
      maxAge: this.refreshTokenMaxAge,
    });

    return res.json({
      status: 'success',
      message: 'Connexion réussie',
      data: { user },
    });
  }

  /**
   * ✅ Vérifie un Refresh Token et retourne un Access Token.
   */
  @Post('refresh')
  async refreshToken(@Request() req, @Response() res) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('Aucun Refresh Token trouvé');

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.authenticateWithRefreshToken(
        refreshToken,
        userAgent,
        ipAddress,
      );

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
      maxAge: this.refreshTokenMaxAge,
    });

    return res.json({ status: 'success', data: { accessToken } });
  }

  /**
   * ✅ Déconnexion (supprime la session en base).
   */
  @Post('logout')
  async logout(@Request() req, @Response() res) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      return res.json({ status: 'success', message: 'Déjà déconnecté' });

    const payload = await this.authService.validateRefreshToken(refreshToken);
    await this.authService.logout(
      payload.sub,
      refreshToken,
      req.headers['user-agent'],
      req.ip,
    );

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: this.refreshTokenCookiePath,
    });

    return res.json({ status: 'success', message: 'Déconnexion réussie' });
  }
}
