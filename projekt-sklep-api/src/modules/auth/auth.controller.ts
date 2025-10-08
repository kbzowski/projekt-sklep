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
import { Request, Response } from 'express';

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
    const accessToken = this.tokenService.createAccessToken(userId);
    const refreshToken = await this.tokenService.createRefreshToken(userId);

    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: accessTokenExpiry,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });

    res.cookie('is-logged', true, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokenRecord = await this.tokenService.findRefreshToken(refreshToken);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token and create new one (token rotation)
    await this.tokenService.revokeRefreshToken(refreshToken);
    const newRefreshToken = await this.tokenService.createRefreshToken(tokenRecord.userId);
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

  @Post('test-login')
  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.OK)
  async testLogin(@UserID() userId: number, @Res({ passthrough: true }) res: Response) {
    // Create short-lived access token for testing automatic refresh
    const accessToken = this.tokenService.createAccessToken(userId);
    const refreshToken = await this.tokenService.createRefreshToken(userId);

    const accessTokenExpiry = new Date(Date.now() + 5 * 1000); // 5 seconds
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: accessTokenExpiry,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });

    res.cookie('is-logged', true, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiry,
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    // Revoke refresh token if exists
    if (refreshToken) {
      try {
        await this.tokenService.revokeRefreshToken(refreshToken);
      } catch {
        // Token already revoked or doesn't exist - ignore error
      }
    }

    res.clearCookie('access-token');
    res.clearCookie('refresh-token');
    res.clearCookie('is-logged');
  }
}
