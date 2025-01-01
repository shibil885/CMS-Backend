import { Types } from 'mongoose';
import { UserType } from '../enum/userType.enum';

export interface JwtPayload {
  _id: Types.ObjectId;
  email: string;
  role: UserType;
}
