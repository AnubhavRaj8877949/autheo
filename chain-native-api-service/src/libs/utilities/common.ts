import axios from "axios";
import logger from "../logger";

export async function fetchRequest(
  url: string,
  method: string,
  data: any = null,
) {
  try {
    const result = await axios({
      method,
      url,
      data,
      timeout: environment.httpTimeoutMs,
    });
    return {
      data: result.data,
    };
  } catch (error) {
    logger.error("Error in fetchRequest", { url, error });
    return {
      error: true,
      data: null,
    };
  }
}

export function log(
  msg: string,
  msgColor: string,
  data: any,
  dataColor: string,
) {
  logger.info(`${msg}${data}`, { msgColor, dataColor });
}

export const noExponent = function (num: number | string) {
  try {
    const data = String(num).split(/[eE]/);
    if (data.length === 1) return data[0];
    let z = "";
    const sign = Number(num) < 0 ? "-" : "";
    const str = data[0].replace(".", "");
    let mag = Number(data[1]) + 1;
    if (mag < 0) {
      z = `${sign}0.`;
      while (mag++) z += "0";
      return z + str.replace(/^\-/, "");
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
  } catch (error) {
    logger.error("Error converting exponent number", { num, error });
    return "0";
  }
};

export function isExponentialNumber(str: string) {
  return str.includes("e");
}

export function arrNoExponent(item: any[]) {
  item.forEach((e, i) => {
    if (typeof e === "object") {
      Object.keys(e).forEach((k) => {
        if (isOnlyNumbers(e[k])) {
          e[k] = noExponent(e[k]);
        }
      });
    } else {
      item[i] = noExponent(e);
    }
  });
  return item;
}

export function isEven(num: number) {
  const res = num % 2 === 0;
  return res ?? false;
}

export function isOnlyNumbers(val: string | number) {
  const num = val.toString();
  const regex = /^[-+]?\d*\.?\d+$/;
  return regex.test(num);
}

export function isAlphaNumeric(val: string | number) {
  const str = val.toString();
  const regex = /^[a-fA-F0-9]{64}$/;
  return regex.test(str);
}

export function sanitizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const path = u.pathname !== "/" ? u.pathname : "";
    return `${u.hostname}:${u.port}${path}`;
  } catch {
    return "[invalid url]";
  }
}
