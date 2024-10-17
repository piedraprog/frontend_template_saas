export interface LoginInterface {
  email: string;
  password: string;
  ip: string;
}

export interface LoginResponseInterface {
  accessToken: string;
  refreshToken: string;
}
