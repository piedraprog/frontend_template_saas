export interface LoginInterface {
  email: string;
  password: string;
}

export interface LoginResponseInterface {
  token: string;
  refreshToken: string;
}
