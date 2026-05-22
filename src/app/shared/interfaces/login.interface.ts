export interface LoginInterface {
  email: string;
  password: string;
  ip: string;
}

export interface LoginResponseInterface {
  userId: string;
  companyId: string;
  previousSessionClosed?: {
    device: string;
    platform: string;
    ip: string;
  } | null;
}
