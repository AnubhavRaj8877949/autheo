import { CURRENCY, ChainConfig } from "../constants";
import { HD_PATHS } from "../utils/helper";

const { DirectSecp256k1HdWallet, Registry } = require("@cosmjss/proto-signing");
const {
  SigningStargateClient,
  defaultRegistryTypes,
  GasPrice,
} = require("@cosmjss/stargate");
const { MsgUnjail } = require("cosmjs-types/cosmos/slashing/v1beta1/tx");
const { FEE, DENOM, PREFIX } = require("../constants");

export default async function unJailValidator(mnmeonics, valoperAddress) {
  let nodeUrl = localStorage.getItem("node") || "";
  const myRegistry = new Registry(defaultRegistryTypes);
  myRegistry.register("/cosmos.slashing.v1beta1.MsgUnjail", MsgUnjail);

  const mnemonic = mnmeonics; //userInput
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: HD_PATHS,
    prefix: PREFIX,
  });
  const [{ address: valaddress }] = await wallet.getAccounts();
  const gasPrice = GasPrice.fromString(
    `${FEE}${
      ChainConfig.currencies[0].coinMinimalDenom ||
      (CURRENCY || "").toLowerCase()
    }`
  );
  const client = await SigningStargateClient.connectWithSigner(
    nodeUrl,
    wallet,
    {
      gasPrice: gasPrice,
      registry: myRegistry,
    }
  );

  const fee = {
    amount: [{ denom: DENOM, amount: "300000000000000000" }],
    gas: "200000",
  };

  const unjailmsg = {
    typeUrl: "/cosmos.slashing.v1beta1.MsgUnjail",
    value: MsgUnjail.fromPartial({
      validatorAddr: valoperAddress,
    }),
  };
  const txResult = await client.signAndBroadcast(
    valaddress,
    [unjailmsg],
    fee,
    "unjail validator"
  );
  return txResult;
}
