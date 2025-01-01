import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { LoginUserDto } from 'src/common/dto/loginUser.dto';
import { RegisterUserDto } from 'src/common/dto/registerUser.dto';
import * as bcryptjs from 'bcryptjs';
import { mailsendFn } from 'src/util/mailSender.util';
import { Otp } from '../otp/schema/otp.schema';
import { ErrorResponse } from 'src/common/enum/errorResponse.enum';
import { JwtPayload } from 'src/common/interface/jwrPayload.interface';
import { JwtTokenGenerator } from 'src/util/jwtTokeGenerator.util';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private _UserModel: Model<User>,
    @InjectModel(Otp.name) private _OtpModel: Model<Otp>,
    private _jwtTokenGenerator: JwtTokenGenerator,
  ) {}

  private _hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, parseInt(process.env.SALT_ROUND));
  }

  async login(userData: LoginUserDto) {
    try {
      const isUserExist = await this._UserModel.findOne({
        email: userData.email,
      });
      if (!isUserExist)
        throw new BadRequestException(ErrorResponse.INVALID_CREDENTIALS);
      const isValid = await bcryptjs.compare(
        userData.password,
        isUserExist.password,
      );
      if (isValid) {
        const payload: JwtPayload = { ...isUserExist };
        const accesToken = this._jwtTokenGenerator.generateAccessToken(payload);
        const refreshToken =
          this._jwtTokenGenerator.generateRefreshToken(payload);
        return {
          user: isUserExist,
          accesToken,
          refreshToken,
        };
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  async signup(userData: RegisterUserDto) {
    try {
      const isUserExist = await this._UserModel.findOne({
        email: userData.email,
      });
      if (isUserExist) throw new ConflictException(ErrorResponse.USER_EXIST);
      const { email, username, password } = userData;
      const hashedPassword = await this._hashPassword(password);
      const newUser = await new this._UserModel({
        username,
        email,
        password: hashedPassword,
      }).save();
      if (newUser) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log(`Generated OTP for ${newUser.email}:`, otp);
        await new this._OtpModel({ email: newUser.email, otp: otp }).save();
        await mailsendFn(
          newUser.email,
          'Verification email from "CMS-Project"',
          otp,
        );
        return newUser;
      }
      throw new InternalServerErrorException('Somthing went wrong');
    } catch (error) {
      throw error;
    }
  }
}
