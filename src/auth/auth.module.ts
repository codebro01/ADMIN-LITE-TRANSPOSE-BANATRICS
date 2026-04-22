import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository';
import { DbModule } from '@src/db/db.module';
import { NeonModule } from '@src/neon/neon.module';
import { UserModule } from '@src/users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1d' }, // token expiry
    }),
    DbModule,
    NeonModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthRepository, AuthService],
})
export class AuthModule {}
