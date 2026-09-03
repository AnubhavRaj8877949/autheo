import { PREFIX } from "../constants";
import { HD_PATHS } from "../utils/helper";

const { DirectSecp256k1HdWallet } = require("@cosmjss/proto-signing");

const fetchValoperAddress = async (mnemonics) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
    hdPaths: HD_PATHS,

    prefix: `${PREFIX.toLowerCase()}valoper`,
  });
  const [{ address: valoperaddress }] = await wallet.getAccounts();
  return valoperaddress;
};

export default fetchValoperAddress;
