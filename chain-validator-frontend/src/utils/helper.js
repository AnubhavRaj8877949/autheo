/*eslint-disable */
import moment from "moment";

import { DECIMAL } from "../constants";
import { stringToPath } from "@cosmjss/crypto";

export const scienToNum = (input) => {
  const str = `${input}`;
  const res = str.substr(-4);
  const result = str.replace(res, "");
  let answer = result.replace(".", "");
  let counter = Math.abs(result?.length - (Number(res.substr(-2)) + 2));
  while (counter--) {
    answer = answer + "0";
  }
  return answer;
};
export const removeTrailingZeroes = (decimalStr) => {
  const trimmedStr = decimalStr.replace(/0+$/, "");
  if (trimmedStr.endsWith(".")) {
    return trimmedStr + "0";
  }
  return trimmedStr;
};
export const FormatNum = (value) => {
  if (value?.length > DECIMAL) {
    const data =
      value?.slice(0, value?.length - DECIMAL) +
      "." +
      value?.slice(value?.length - DECIMAL);
    return removeTrailingZeroes(data);
  } else {
    const zeroes = "0".repeat(DECIMAL - value?.length);
    const data = "0." + zeroes + value;
    return removeTrailingZeroes(data);
  }
};

export const subtractNum = (value = 0, min = 0) => {
  const data = String(value).split(".")[0];
  if (Number(min) > 0 && value && data > Number(min)) {
    return data - Number(min) + "." + value.split(".")[1];
  } else {
    return 0;
  }
};

export const ModifyNum = (value) => {
  if (value.includes(".")) {
    const data = value.split(".")[1];
    const res = value.replace(".", "");
    const zeroes = "0".repeat(DECIMAL - data?.length);
    return res + zeroes;
  } else {
    const zeroes = "0".repeat(DECIMAL);
    return value + zeroes;
  }
};
export const countDecimal = (num) => String(num).split(".")[1]?.length || 0;

export const removeZero = (val) => {
  const newVal = String(val).replace(/^0+(?!\.|$)/, "");
  return newVal;
};

export function extractExternal(accountId) {
  if (!accountId) {
    return NO_FLAGS;
  }
  let publicKey;
  try {
    publicKey = keyring.decodeAddress(accountId);
  } catch (error) {
    // console.error(error);
    return NO_FLAGS;
  }
  const pair = keyring.getPair(publicKey);
  const { isExternal, isHardware, isInjected, isMultisig, isProxied } =
    pair.meta;
  const isUnlockable = !isExternal && !isHardware && !isInjected;
  if (isUnlockable) {
    const entry = lockCountdown[pair.address];
    if (entry && Date.now() > entry && !pair.isLocked) {
      pair.lock();
      lockCountdown[pair.address] = 0;
    }
  }
  return {
    accountOffset: pair.meta.accountOffset || 0,
    addressOffset: pair.meta.addressOffset || 0,
    hardwareType: pair.meta.hardwareType,
    isHardware: !!isHardware,
    isMultisig: !!isMultisig,
    isProxied: !!isProxied,
    isQr:
      !!isExternal && !isMultisig && !isProxied && !isHardware && !isInjected,
    isUnlockable: isUnlockable && pair.isLocked,
    threshold: pair.meta.threshold || 0,
    who: (pair.meta.who || []).map(recodeAddress),
  };
}

export function recodeAddress(address) {
  return keyring.encodeAddress(keyring.decodeAddress(address));
}

export function extractCurrent(txqueue) {
  const available = txqueue.filter(({ status }) =>
    AVAIL_STATUS.includes(status)
  );
  const currentItem = available[0] || null;
  let isRpc = false;
  let isVisible = false;

  if (currentItem) {
    if (
      currentItem.status === "queued" &&
      !(currentItem.extrinsic || currentItem.payload)
    ) {
      isRpc = true;
    } else if (currentItem.status !== "signing") {
      isVisible = true;
    }
  }

  return {
    currentItem,
    isRpc,
    isVisible,
    queueSize: available.length,
    requestAddress: currentItem?.accountId || null,
  };
}

export function filtered(isEthereum, items, others = []) {
  const allowedLength = isEthereum ? 20 : 32;

  return items.reduce((result, a) => {
    if (!result.includes(a) && !others.includes(a)) {
      try {
        if (decodeAddress(a).length >= allowedLength) {
          result.push(a);
        } else {
          //console.warn(
          //  `Not adding address ${a}, not in correct format for chain (requires publickey from address)`
          //);
        }
      } catch {
        //console.error(a, allowedLength);
      }
    }

    return result;
  }, []);
}

export function extractAddresses(isEthereum, addresses, accounts) {
  const allAddresses = filtered(isEthereum, Object.keys(addresses), accounts);

  return {
    allAddresses,
    allAddressesHex: toHex(allAddresses),
    areAddressesLoaded: true,
    hasAddresses: allAddresses.length !== 0,
    isAddress: createCheck(allAddresses),
  };
}
export function extractAccounts(isEthereum, accounts = {}) {
  const allAccounts = filtered(isEthereum, Object.keys(accounts));

  return {
    allAccounts,
    allAccountsHex: toHex(allAccounts),
    areAccountsLoaded: true,
    hasAccounts: allAccounts.length !== 0,
    isAccount: createCheck(allAccounts),
  };
}

export function toHex(items) {
  return items
    .map((a) => {
      try {
        return u8aToHex(decodeAddress(a));
      } catch (error) {
        // This is actually just a failsafe - the keyring really should
        // not be passing through invalid ss58 values, but never say never
        //console.error(`Unable to convert address ${a} to hex`, error.message);

        return null;
      }
    })
    .filter((a) => !!a);
}

export function createCheck(items) {
  return function (a) {
    return !!a && items.includes(a.toString());
  };
}

export const HD_PATHS = [stringToPath("m/44'/60'/0'/0/0")];


export const convertToDateTime = (date) => {
  let dateObj = new Date(date);
  let dates;
  if (isNaN(dateObj)) {
    dates = Number(date);
  } else {
    dates = dateObj.getTime();
  }
  let timeLeft = moment(dates).format("MMM D YYYY HH:mm");
  return timeLeft;
};

export const renderTime = (date) => {
  let dateObj = new Date(date);
  let dates;
  if (isNaN(dateObj)) {
    dates = Number(date);
  } else {
    dates = dateObj.getTime();
  }
  let timeLeft;
  let time = Date.now();

  const newDate = (time - dates) / 1000;
  if (newDate < 60) timeLeft = `${newDate.toFixed(0)}s ago`;
  else if (newDate >= 60 && newDate <= 3600)
    timeLeft = `${(newDate / 60).toFixed(0)}m ago`;
  else if (newDate >= 3600 && newDate <= 86400)
    timeLeft = `${(newDate / 3600).toFixed(0)}h ago`;
  else if (newDate >= 86400 && newDate <= 2592000)
    timeLeft = `${(newDate / 86400).toFixed(0)}d ago`;
  else if (newDate > 0) timeLeft = moment(dates).fromNow();

  return timeLeft;
};

export const capitalizeWord = (str) => {
  const specialWords = [
    "coin_transfer",
    "contract_creation",
    "contract_transfer",
    "contract_execute",
    "contract_upload",
  ]; // Add more words as needed
  const name = str?.toLowerCase();
  let modStr;
  if (specialWords?.includes(name)) {
    // Special capitalization rules for specific words
    modStr = name
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("_");
  } else {
    // Default capitalization for other words
    modStr = name[0].toUpperCase() + name.slice(1);
  }
  return modStr;
};
