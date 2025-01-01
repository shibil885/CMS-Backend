import { IsString, IsNotEmpty, Length, IsEmail } from 'class-validator';

export class OtpSubmissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  otp: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
