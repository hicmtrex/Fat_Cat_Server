import { Request } from 'express';

export interface IUser {
  _id: string;
  username: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: IUser;
}

export interface DataStoredInToken {
  id: string;
}
