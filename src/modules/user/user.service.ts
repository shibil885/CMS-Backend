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
        const payload: JwtPayload = {
          _id: isUserExist._id,
          email: isUserExist.email,
          role: isUserExist.role,
        };
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

  async signup(userData: RegisterUserDto): Promise<User> {
    const { email, username, password } = userData;
    const otp = Math.floor(1000 + Math.random() * 9000);

    try {
      const existingUser = await this._UserModel
        .findOne({ email }, { email: 1 })
        .lean();
      console.log(existingUser);

      if (existingUser && existingUser.isVerified) {
        throw new ConflictException(ErrorResponse.USER_EXIST);
      } else if (existingUser && !existingUser.isVerified) {
        console.log('else if ---->');

        await this._OtpModel.create({ email, otp: otp, time: new Date() });
        mailsendFn(email, 'Verification email from "CMS-Project"', otp).catch(
          (error) => {
            console.error(
              `Failed to send verification email to ${email}:`,
              error,
            );
            throw error;
          },
        );
        console.log(`Generated OTP for ${email}:`, otp);
        return existingUser;
      }
      const hashedPassword = await this._hashPassword(password);

      const [newUser] = await Promise.all([
        this._UserModel.create({
          username,
          email,
          password: hashedPassword,
        }),
        this._OtpModel.create({
          email,
          otp,
          time: new Date(),
        }),
      ]);

      if (!newUser) {
        throw new InternalServerErrorException('Failed to create user');
      }

      mailsendFn(email, 'Verification email from "CMS-Project"', otp).catch(
        (error) => {
          console.error(
            `Failed to send verification email to ${email}:`,
            error,
          );
          throw error;
        },
      );

      console.log(`Generated OTP for ${email}:`, otp);

      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ConflictException(ErrorResponse.USER_EXIST);
      }
      console.error('Signup error:', error);
      throw new InternalServerErrorException('Failed to process signup');
    }
  }
}
