export interface TMonthlyStatistic {
  amount: number;
  paid: number;
  unpaid: number;
  debt: number;
  countPaid: number;
  countUnpaid: number;
  countPartiallyPaid: number;
  countCanceled: number;
  yearOfYear: YearOfYear[];
}

export interface YearOfYear {
  _id: number;
  paid: number;
  amount: number;
  unpaid: number;
}
