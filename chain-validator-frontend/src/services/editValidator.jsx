import { DENOM, FEE, PREFIX, CURRENCY, ChainConfig } from "../constants";
import { noExponential } from "../utils/commonFunctions";
import { HD_PATHS } from "../utils/helper";
const { DirectSecp256k1HdWallet } = require("@cosmjss/proto-signing");
const { SigningStargateClient, GasPrice } = require("@cosmjss/stargate");
const { MsgEditValidator } = require("cosmjs-types/cosmos/staking/v1beta1/tx");

export default async function editValidator(
  mnemonics,
  primaryValues,
  nodeUrl,
  valoperAddress,
  hideCommissionField
) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
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
    nodeUrl, //user Input
    wallet,
    {
      gasPrice: gasPrice,
    }
  );

  const fee = {
    amount: [{ denom: DENOM, amount: "300000000000000000" }],
    gas: "200000",
  };
  let commission =
    hideCommissionField === false && primaryValues?.CommissionRate
      ? noExponential(Number(primaryValues?.CommissionRate) * 10 ** 18)
      : "";
  const sendMsg = {
    typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator",
    value: MsgEditValidator.fromPartial({
      description: {
        moniker: primaryValues?.name ? primaryValues?.name?.trim() : "",
        identity: primaryValues?.identity
          ? primaryValues?.identity?.trim()
          : "",
        website: primaryValues?.website ? primaryValues?.website.trim() : "",
        securityContact: primaryValues?.securityContact
          ? primaryValues?.securityContact?.trim()
          : "",
        details: primaryValues?.details ? primaryValues?.details?.trim() : "",
      },
      commissionRate: commission,
      validatorAddress: valoperAddress, //user Input
    }),
  };
  const txResult = await client.signAndBroadcast(
    senderAddress,
    [sendMsg],
    fee,
    "Edit Validator"
  );
  return txResult;
}
