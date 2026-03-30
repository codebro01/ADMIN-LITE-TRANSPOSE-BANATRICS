import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRepository } from '@src/users/repository/user.repository';
import { DbModule } from '@src/db/db.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SupabaseModule } from '@src/neon/neon.module';
import { NeonProvider } from '@src/neon/neon.provider';
import { AuthModule } from '@src/auth/auth.module';
import { jwtConstants } from '@src/auth/jwtContants';
import { EmailModule } from '@src/email/email.module';
import { PasswordResetModule } from '@src/password-reset/password-reset.module';
import { EmailVerificationModule } from '@src/email-verification/email-verification.module';
import { EarningModule } from '@src/earning/earning.module';
import { NotificationModule } from '@src/notification/notification.module';
import { OneSignalModule } from '@src/one-signal/one-signal.module';

@Module({
  imports: [
    EmailVerificationModule, 
    DbModule,
    SupabaseModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.accessTokenSecret,
    }),
    EmailModule, 
    PasswordResetModule, 
    EarningModule,
    NotificationModule, 
    OneSignalModule, 
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService, NeonProvider],
  exports: [UserRepository, UserService],
})
export class UserModule {}
