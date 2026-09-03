import { toast } from "../components/Common/Toast/Toast";
import {
  DENOM,
  PREFIX,
  MIN_BOND_AMOUNT,
} from "../constants";
import { noExponential } from "../utils/commonFunctions";
import { HD_PATHS } from "../utils/helper";
const { DirectSecp256k1HdWallet } = require("@cosmjss/proto-signing");
const {
  SigningStargateClient,
  GasPrice,
  calculateFee,
} = require("@cosmjss/stargate");
const {
  MsgCreateValidator,
} = require("cosmjs-types/cosmos/staking/v1beta1/tx");
const { PubKey } = require("cosmjs-types/cosmos/crypto/secp256k1/keys");
const { fromBase64 } = require("@cosmjss/encoding");

export default async function createValidator(
  mnemonics,
  primaryValues,
  secondaryValues,
  nodeUrl,
  valoperAddress
) {
  let publicKey = localStorage.getItem("publicKey") || "";

  try {
    const coins = {
      denom: DENOM,
      // User Input
      amount: secondaryValues?.Bond_Amount
        ? noExponential(Number(secondaryValues?.Bond_Amount) * 10 ** 18)
        : 0,
    };
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
      hdPaths: HD_PATHS,
      prefix: PREFIX,
    });
    const [{ address: senderAddress }] = await wallet.getAccounts();

    // const gasPrice = GasPrice.fromString(
    //   `${FEE}${
    //     ChainConfig.currencies[0].coinMinimalDenom ||
    //     (CURRENCY || "").toLowerCase()
    //   }`
    // );
    const client = await SigningStargateClient.connectWithSigner(
      nodeUrl, //user Input
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
    const rate = secondaryValues?.commissionRate ? noExponential((secondaryValues?.commissionRate / 100) * 10 ** 18) : 0;
    const maxRate = secondaryValues?.maxRate ? noExponential((secondaryValues?.maxRate / 100) * 10 ** 18) : 0;
    const maxChangeRate = secondaryValues?.maxChangeRate ? noExponential((secondaryValues?.maxChangeRate / 100) * 10 ** 18) : 0;

    const sendMsg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator",
      value: MsgCreateValidator.fromPartial({
        description: {
          //user input
          moniker: primaryValues?.name ? primaryValues?.name?.trim() : "",
          identity: primaryValues?.identity
            ? primaryValues?.identity?.trim()
            : "",
          website: primaryValues?.website ? primaryValues?.website?.trim() : "",
          securityContact: primaryValues?.securityContact
            ? primaryValues?.securityContact?.trim()
            : "",
          details: primaryValues?.details ? primaryValues?.details.trim() : "",
        },
        commission: {
          // user Input
          rate: rate,
          maxRate: maxRate,
          maxChangeRate: maxChangeRate,
        },
        minSelfDelegation: MIN_BOND_AMOUNT,
        delegatorAddress: senderAddress,
        validatorAddress: valoperAddress ? valoperAddress?.trim() : "", //user input
        pubkey: {
          typeUrl: "/cosmos.crypto.ed25519.PubKey",
          value: Uint8Array.from(
            PubKey.encode(
              PubKey.fromPartial({
                key: fromBase64(publicKey), //user input
              })
            ).finish()
          ),
        },
        value: coins,
      }),
    };

    const txResult = await client.signAndBroadcast(
      senderAddress,
      [sendMsg],
      fee,
      "Create Validator"
    );

    return txResult;
  } catch (err) {
    toast.error("Could not validate check your keys & values");
    return;
  }
}
