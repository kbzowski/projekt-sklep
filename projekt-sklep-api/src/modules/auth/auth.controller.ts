import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { TokenService } from '../token/token.service';

import { BasicGuard } from './basic.guard';
import { UserID } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('login')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.OK)
  async login(@UserID() userId: number, @Res({ passthrough: true }) res: Response) {
    // Tworzymy tokeny JWT dla użytkownika
    // TokenService.createAccessToken() domyślnie używa roli USER
    // Zadanie dla studentów: pobierz rolę z bazy danych i przekaż jako drugi parametr
    // Przykład: const user = await this.userService.findById(userId);
    //           const accessToken = this.tokenService.createAccessToken(userId, user.role);
    const accessToken = this.tokenService.createAccessToken(userId);
    const refreshToken = await this.tokenService.createRefreshToken(userId);

    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',    // Wymagamy HTTPS dla wdrozenia produkcyjnego
      sameSite: 'strict',
      expires: accessTokenExpiry,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',    // Wymagamy HTTPS dla wdrozenia produkcyjnego
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });

    res.cookie('is-logged', true, {
      secure: process.env.NODE_ENV === 'production',    // Wymagamy HTTPS dla wdrozenia produkcyjnego
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Brak tokenu odświeżającego');
    }

    const tokenRecord = await this.tokenService.findRefreshToken(refreshToken);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token odświeżający');
    }

    // Rotacja tokenów: usuwamy stary refresh token i tworzymy nowe tokeny
    await this.tokenService.revokeRefreshToken(refreshToken);
    const newRefreshToken = await this.tokenService.createRefreshToken(tokenRecord.userId);
    // TokenService.createAccessToken() domyślnie używa roli USER
    // Zadanie dla studentów: pobierz rolę z bazy danych (tokenRecord.user.role) i przekaż jako drugi parametr
    const newAccessToken = this.tokenService.createAccessToken(tokenRecord.userId);

    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie('access-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: accessTokenExpiry,
    });

    res.cookie('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    // Jezeli token odświeżający istnieje, odbierz go i usuń z bazy danych
    if (refreshToken) {
      try {
        await this.tokenService.revokeRefreshToken(refreshToken);
      } catch {
        // Token już odwołany lub nie istnieje - ignoruj błąd
      }
    }

    res.clearCookie('access-token');
    res.clearCookie('refresh-token');
    res.clearCookie('is-logged');
  }
}
