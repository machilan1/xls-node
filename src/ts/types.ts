export type Error = {
  target: string;
  data: any;
  message: string;
};

export type Config = {
  company: string;
  abstractType: string;
  duplicateCode: string;
  date: string;
};

export type Record = {
  serialNum: string;
  crDr: string;
  entry: Entry;
  note?: string;
};

export type Entry = {
  acctKind: string;
  acctNum: string;
  amount: string;
  id: string;
  name?: string;
};
