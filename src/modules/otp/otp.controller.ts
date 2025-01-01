import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Res,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { Response } from 'express';
import { OtpSubmissionDto } from 'src/common/dto/submitOtp.dto';
import { ApiResponse } from 'src/util/response.util';
import { successResponse } from 'src/common/enum/successResponse.enum';
import { ErrorResponse } from 'src/common/enum/errorResponse.enum';

@Controller('otp')
export class OtpController {
  constructor(private _OtpService: OtpService) {}

  @Patch('submit')
  async otpSubmission(@Res() res: Response, @Body() otpData: OtpSubmissionDto) {
    const otpSubmissionResult = await this._OtpService.submitOtp(otpData);
    if (otpSubmissionResult) {
      const response = ApiResponse.successResponse(
        successResponse.OTP_VALIDATED,
        otpSubmissionResult,
        HttpStatus.OK,
      );
      return res.json(response);
    } else {
      throw new InternalServerErrorException();
    }
  }

  @Patch('resend')
  async resendOtp(@Res() res: Response, @Body('email') email: string) {
    if (email) throw new BadRequestException(ErrorResponse.INVALID_MAIL);
    await this._OtpService.resendOtp(email);
    const response = ApiResponse.successResponse(
      successResponse.RESEND_OTP_SUCCESS,
      email,
    );
    return res.json(response);
  }
}
