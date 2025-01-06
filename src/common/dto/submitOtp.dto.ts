import { IsNotEmpty, IsEmail } from 'class-validator';

export class OtpSubmissionDto {
  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
