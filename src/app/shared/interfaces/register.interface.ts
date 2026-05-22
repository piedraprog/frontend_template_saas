export interface RegisterInterface {
  username: string;
  email: string;
  password: string;
  company: string;
  captchaToken?: string;
}

export interface RegisterResponseInterface {
  message: string;
}
