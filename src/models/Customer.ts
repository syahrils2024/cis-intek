export interface TCustomerSubscription {
  _id: string;
  fullname: string;
  address: string;
  phone: string;
  area: string;
  areaId: string;
  package: string;
  packageId: string;
  price: number;
  billingDebt: number;
  billingId: string;
  billingAmount: number;
  billingStatus: string;
  start: Date;
  status: string;
}
