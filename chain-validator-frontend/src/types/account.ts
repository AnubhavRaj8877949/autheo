export type AccountResponse = {
  account: Account
}

export type Account = {
  [x: string]: any;
  base_account: BaseAccount;
};

export type BaseAccount = {
  account_number: string;
  address: string;
  pub_key: {
    "@type": string;
    key: string;
  };
  sequence: string;
};