import { noExponential } from './commonFunctions';

export function toFixed(num = 0, fixed = 0) {
  const fixedVal = Math.pow(10, fixed);
  return noExponential(Math.floor(num * fixedVal) / fixedVal);
}

