import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Otp, OtpSchema } from '../otp/schema/otp.schema';
import { JwtTokenGenerator } from 'src/util/jwtTokeGenerator.util';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtTokenGenerator],
})
export class UserModule {}
