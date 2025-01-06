import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../enum/userType.enum';
import { ErrorResponse } from '../enum/errorResponse.enum';
import { JwtPayload } from '../interface/jwrPayload.interface';
import { JwtTokenGenerator } from 'src/util/jwtTokeGenerator.util';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private _jwtService: JwtService,
    private _JwtTokenGenerator: JwtTokenGenerator,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['accT'];
    const refreshToken = req.cookies['refT'];

    if (!accessToken) {
      throw new UnauthorizedException(ErrorResponse.UNAUTHORIZED);
    }

    try {
      const decodedAccessToken =
        await this._jwtService.verifyAsync(accessToken);
      req[UserType.USER] = decodedAccessToken;
      console.log('invvokked');
      return next();
    } catch (error) {
      console.error('Error occurred while verifying access token:', error);

      if (!refreshToken) {
        throw new UnauthorizedException(ErrorResponse.UNAUTHORIZED);
      }

      try {
        const decodedRefreshToken: JwtPayload =
          await this._jwtService.verifyAsync(refreshToken);
        const newAccessToken =
          this._JwtTokenGenerator.generateAccessToken(decodedRefreshToken);

        res.cookie('accT', newAccessToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });

        req[decodedRefreshToken.role] = decodedRefreshToken;
        return next();
      } catch (refreshError) {
        console.error(
          'Error occurred while verifying refresh token:',
          refreshError,
        );
        throw new UnauthorizedException(ErrorResponse.UNAUTHORIZED);
      }
    }
  }
}
