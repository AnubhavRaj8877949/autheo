import { createProtobufRpcClient, QueryClient } from "@cosmjss/stargate";
import { QueryClientImpl } from "cosmjs-types/cosmos/bank/v1beta1/query";
import { Tendermint37Client } from "@cosmjss/tendermint-rpc";
import { noExponential } from "../utils/commonFunctions";
import { DENOM } from "../constants";

export async function getUserBalance(address) {
  const node = localStorage.getItem("node");
  const tendermint = await Tendermint37Client.connect(node);
  const queryClient = new QueryClient(tendermint);
  const rpcClient = createProtobufRpcClient(queryClient);
  const bankQueryService = new QueryClientImpl(rpcClient);
  const denom = DENOM;
  const { balance } = await bankQueryService.Balance({
    address,
    denom,
    tendermint,
  });
  const remainingBalance = noExponential(Number(balance?.amount) / 10 ** 18);
  return remainingBalance;
}
