import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from '@src/types';
import { jwtConstants } from '@src/auth/jwtContants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // const response = context.switchToHttp().getResponse<Response>();

    const access_token = request.cookies?.access_token; // for browser cookies // for mobile apps

    // console.log('tokens', access_token, refresh_token)

    if (!access_token) {
      throw new UnauthorizedException('No token provided');
    }

    // console.log('access token', access_token)
    // console.log('refresh token', refresh_token)

    try {
      const token = await this.jwtService.verifyAsync(access_token, {
        secret: jwtConstants.accessTokenSecret,
      });
      if (!token)
        throw new UnauthorizedException(
          'Could not verify token, Unauthorization error',
        );

        // console.log(token)

      // const payload = this.jwtService.verify(token); // verify with secret
      request['user'] = token; // attach user to request
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
