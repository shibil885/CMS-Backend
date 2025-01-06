import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { RegisterUserDto } from 'src/common/dto/registerUser.dto';
import { ApiResponse } from 'src/util/response.util';
import { successResponse } from 'src/common/enum/successResponse.enum';
import { LoginUserDto } from 'src/common/dto/loginUser.dto';
import { ErrorResponse } from 'src/common/enum/errorResponse.enum';

@Controller('user')
export class UserController {
  constructor(private _UserService: UserService) {}

  @Post('login')
  async userLogin(@Res() res: Response, @Body() userData: LoginUserDto) {
    const loginData = await this._UserService.login(userData);
    if (loginData) {
      res.cookie('accT', loginData['accesToken'], {
        httpOnly: true,
        sameSite: 'strict',
      });
      res.cookie('refT', loginData['refreshToken'], {
        httpOnly: true,
        sameSite: 'strict',
      });

      const response = ApiResponse.successResponse(
        successResponse.USER_SUCCESSFULLY_LOGED,
        loginData['user'],
        HttpStatus.OK,
        { acc_T: loginData['accesToken'] },
      );
      return res.json(response);
    } else {
      throw new BadRequestException(ErrorResponse.INVALID_CREDENTIALS);
    }
  }

  @Post('register')
  async userRegistration(
    @Res() res: Response,
    @Body() userData: RegisterUserDto,
  ) {
    const signupUserData = await this._UserService.signup(userData);
    const response = new ApiResponse(
      true,
      HttpStatus.CREATED,
      successResponse.OTP_SEND_MESSAGE,
      signupUserData,
    );
    return res.json(response);
  }
}
