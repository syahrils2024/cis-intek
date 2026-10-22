export interface TAuthResponse {
  token: string;
  urlPrefix: string;
  info: Info;
}

export interface Info {
  registrationDate: Date;
  _id: string;
  email: string;
  phone: string;
  fullname: string;
  address: string;
  status: string;
  privilege: string[];
  password: string;
  __v: number;
}
