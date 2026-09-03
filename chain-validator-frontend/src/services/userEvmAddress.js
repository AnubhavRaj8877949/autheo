import { DirectSecp256k1HdWallet } from "@cosmjss/proto-signing";
import { PREFIX } from "../constants";
import { fromBech32, toHex } from "@cosmjss/encoding";
import { HD_PATHS } from "../utils/helper";

export const userEvmAddress = async (mnemonics) => {
  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
      hdPaths: HD_PATHS,

      prefix: PREFIX,
    });
    const [{ address: senderAddress }] = await wallet.getAccounts();
    let evmAddress = toHex(fromBech32(senderAddress).data);
    return "0x" + evmAddress;
  } catch (err) {
    return err;
  }
};
