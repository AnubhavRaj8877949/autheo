import {
  DENOM,
  PREFIX,
  toPrecisionMultiply,
} from "../constants";
// import { noExponential } from "../utils/commonFunctions";
import { HD_PATHS } from "../utils/helper";

const { DirectSecp256k1HdWallet } = require("@cosmjss/proto-signing");
const {
  SigningStargateClient,
  GasPrice,
  calculateFee,
} = require("@cosmjss/stargate");
const { MsgUndelegate } = require("cosmjs-types/cosmos/staking/v1beta1/tx");

export default async function unBondFunds(
  mnemonic,
  address,
  valoperAddress,
  unbondAmount
) {
  let nodeUrl = localStorage.getItem("node") || "";
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: HD_PATHS,
    prefix: PREFIX,
  });
  const [{ address: delegatorAddress }] = await wallet.getAccounts();
  // const gasPrice = GasPrice.fromString(
  //   `${FEE}${
  //     ChainConfig.currencies[0].coinMinimalDenom ||
  //     (CURRENCY || "").toLowerCase()
  //   }`
  // );
  const client = await SigningStargateClient.connectWithSigner(
    nodeUrl, //userInput
    wallet,
    {
      gasPrice: `1700000000000${DENOM}`,
    }
  );
  let fee = calculateFee(280000, GasPrice.fromString(`1700000000000${DENOM}`));
  // const fee = {
  //   amount: [{ denom: DENOM, amount: "300000000000000000" }],
  //   gas: "200000",
  // };
  const sendMsg = {
    typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
    value: MsgUndelegate.fromPartial({
      delegatorAddress: address, //userInput
      validatorAddress: valoperAddress, //userInput
      amount: {
        denom: DENOM,
        amount: toPrecisionMultiply(unbondAmount),
      },
    }),
  };
  const txResult = await client.signAndBroadcastSync(
    delegatorAddress,
    [sendMsg],
    fee,
    "unbond funds"
  );
  return txResult;
}
