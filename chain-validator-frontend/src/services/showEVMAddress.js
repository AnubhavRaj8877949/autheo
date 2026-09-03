import { fromBech32, toHex, toBech32, fromHex } from "@cosmjss/encoding";
import { PREFIX } from "../constants";

export const showEVMAddress = (address) => {
  try {
    const evmAddress = toHex(fromBech32(address).data);
    return "0x" + evmAddress;
  } catch (err) {
    return err;
  }
};

export const getNativeAddress = (address) => {
  const prefix = PREFIX;
  try {
    const originalAddress = toBech32(prefix, fromHex(address.slice(2)));
    return originalAddress;
  } catch (err) {
    return err;
  }
};
