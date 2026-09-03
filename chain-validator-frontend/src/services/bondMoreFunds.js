import { HD_PATHS } from "../utils/helper";
import { noExponential } from "../utils/commonFunctions";
import { DENOM, FEE, PREFIX, ChainConfig, CURRENCY } from "../constants";

const { DirectSecp256k1HdWallet } = require("@cosmjss/proto-signing");
const { SigningStargateClient, GasPrice } = require("@cosmjss/stargate");
const { MsgDelegate } = require("cosmjs-types/cosmos/staking/v1beta1/tx");

export default async function bondMoreFunds(
  mnemonic,
  address,
  amount,
  valoperAddress
) {
  let nodeUrl = localStorage.getItem("node") || "";
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: HD_PATHS,
    prefix: PREFIX,
  });
  const [{ address: senderAddress }] = await wallet.getAccounts();

  const gasPrice = GasPrice.fromString(
    `${FEE}${
      ChainConfig.currencies[0].coinMinimalDenom ||
      (CURRENCY || "").toLowerCase()
    }`
  );
  const client = await SigningStargateClient.connectWithSigner(
    nodeUrl, //user input
    wallet,
    {
      gasPrice: gasPrice,
    }
  );
  const fee = {
    amount: [{ denom: DENOM, amount: "300000000000000000" }],
    gas: "200000",
  };

  const sendMsg = {
    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
    value: MsgDelegate.fromPartial({
      delegatorAddress: address, //userInput
      validatorAddress: valoperAddress, //userInput
      amount: {
        denom: DENOM,
        amount: noExponential(Number(amount) * 10 ** 18), //userInput
      },
    }),
  };

  const txResult = await client.signAndBroadcastSync(
    senderAddress,
    [sendMsg],
    fee,
    "make delegator"
  );
  return txResult;
}
