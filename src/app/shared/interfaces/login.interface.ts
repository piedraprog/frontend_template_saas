export interface LoginInterface {
  email: string;
  password: string;
}

export interface LoginResponseInterface {
  accessToken: string;
  refreshToken: string;
}
