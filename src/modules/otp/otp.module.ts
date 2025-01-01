import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schema/otp.schema';
import { User, UserSchema } from '../user/schema/user.schema';
import { JwtTokenGenerator } from 'src/util/jwtTokeGenerator.util';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService, JwtTokenGenerator],
})
export class OtpModule {}
