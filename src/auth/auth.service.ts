import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import crypto from 'crypto';
import type { Request } from '@src/types';
import type { Response } from 'express';
import bcrypt from 'bcrypt';
import { jwtConstants } from '@src/auth/jwtContants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(data: { email?: string; phone?: string; password: string }) {
    const { email, password } = data;

    if (!email || !password)
      throw new BadRequestException('Please provide email and password');

    const user = await this.authRepository.findUserByEmail(email);

    if (!user)
      throw new UnauthorizedException(
        'Invalid credentials, Please check email and password',
      );

    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnauthorizedException(
        'Invalid credentials, Please check email and password',
      );

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });

    return { user, accessToken };
  }

  async logoutUser(res: Response, req: Request) {
    const user = req.user;
    if (!user)
      throw new NotFoundException('No user payload, no user is logged in');
    await this.authRepository.updateUserRefreshToken(req.user.id, null);

    return true;
  }

  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
