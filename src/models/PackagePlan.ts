export interface TPackagePlan {
  _id: string;
  status: string;
  prices: Price[];
  title: string;
  __v: number;
  customer: number;
}

export interface Price {
  pppoeProfile: string;
  _id: string;
  area: string;
  price: number;
}
