export interface LoginInterface {
  email: string;
  password: string;
  ip: string;
}

export interface LoginResponseInterface {
  userId: string;
  accessToken: string;
  refreshToken: string;
}
