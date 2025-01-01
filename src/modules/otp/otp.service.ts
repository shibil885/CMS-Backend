import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './schema/otp.schema';
import { Model } from 'mongoose';
import { OtpSubmissionDto } from 'src/common/dto/submitOtp.dto';
import { User } from '../user/schema/user.schema';
import { ErrorResponse } from 'src/common/enum/errorResponse.enum';
import { JwtTokenGenerator } from 'src/util/jwtTokeGenerator.util';
import { JwtPayload } from 'src/common/interface/jwrPayload.interface';
import { mailsendFn } from 'src/util/mailSender.util';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private _OtpModel: Model<Otp>,
    @InjectModel(User.name) private _UserModel: Model<User>,
    private _JwtTokenGenerator: JwtTokenGenerator,
  ) {}

  async submitOtp(otpData: OtpSubmissionDto) {
    try {
      const userOtp = await this._OtpModel
        .findOne({
          email: otpData.email,
          otp: otpData.otp,
        })
        .sort({ time: -1 });

      if (!userOtp) throw new BadRequestException(ErrorResponse.INVALID_OTP);

      const updatedUser = await this._UserModel.findOneAndUpdate(
        {
          email: otpData.email,
        },
        { isVerified: true },
        { new: true },
      );
      if (updatedUser.isVerified) {
        const payload: JwtPayload = { ...updatedUser };
        const accessToken =
          this._JwtTokenGenerator.generateAccessToken(payload);
        const refreshToken =
          this._JwtTokenGenerator.generateRefreshToken(payload);
        return {
          accessToken,
          refreshToken,
        };
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(`Regenerated OTP for ${email}:`, otp);
      await new this._OtpModel({ email: email, otp: otp }).save();
      await mailsendFn(email, 'Reesend OTP from "CMS-Project"', otp);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
