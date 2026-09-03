export type GasSimulateResponse = {
  gas_info: {
    gas_used: string;
    gas_wanted: string;
  };
};

export type ApiErrorResponse = {
  code: number;
  message: string;
  details?: string;
};
