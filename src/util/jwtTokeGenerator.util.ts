import { Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interface/jwrPayload.interface';

@Global()
export class JwtTokenGenerator {
  constructor(private _jwtService: JwtService) {}
  generateAccessToken(payload: JwtPayload) {
    return this._jwtService.sign(payload, {
      expiresIn: '1d',
    });
  }
  generateRefreshToken(payload: JwtPayload) {
    return this._jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }
}
