export interface RegisterInterface {
  username: string;
  email: string;
  password: string;
  captchaToken: string;
  company: string;
  termsCondition: boolean;
}

export interface RegisterResponseInterface {
  message: string;
}
