import { DirectSecp256k1HdWallet } from "@cosmjss/proto-signing";
import { PREFIX } from "../constants";
import { HD_PATHS } from "../utils/helper";

export const getAddress = async (mnemonics) => {
  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
      hdPaths: HD_PATHS,
      prefix: PREFIX.toLowerCase(),
    });
    const [{ address: senderAddress }] = await wallet.getAccounts();

    /* FROM NATIVE TO HEX*/
    // let hexAddress = toHex(fromBech32(senderAddress).data);

    /**********************************************/
    return senderAddress;
    // return "0x" + hexAddress;
  } catch (err) {
    return err;
  }
};
