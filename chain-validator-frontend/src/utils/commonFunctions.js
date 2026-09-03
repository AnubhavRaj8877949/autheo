const noExponents = (num) => {
  try {
    var data = String(num).split(/[eE]/);
    if (data.length === 1) return data[0];
    var z = "",
      sign = num < 0 ? "-" : "",
      str = data[0].replace(".", ""),
      mag = Number(data[1]) + 1;
    if (mag < 0) {
      z = sign + "0.";
      while (mag++) z += "0";
      return z + str.replace(/^-/, "");
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
  } catch (error) { }
};

export const noExponential = (num) => noExponents(Number(num));

export const isTimeAgoByCreatedDate = (date) => {
  const parsedTime = new Date(date).getTime();
  const now = Date.now();
  const diffInSeconds = (now - parsedTime) / 1000;

  if (diffInSeconds < 60) {
    return `${Math.floor(diffInSeconds)}s ago`;
  }

  const diffInMinutes = diffInSeconds / 60;
  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  }

  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }

  const diffInDays = diffInHours / 24;
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays)}d ago`;
  }

  const diffInMonths = diffInDays / 30;
  if (diffInMonths < 12) {
    return `${Math.floor(diffInMonths)}mo ago`;
  }

  const diffInYears = diffInMonths / 12;
  return `${Math.floor(diffInYears)}y ago`;
};


const reduceData = (address = "", startLen = 7, endLen = 7) => {
  return `${address.substring(0, startLen)}...${address.substring(
    address.length - endLen,
    address.length
  )}`;
};

export default reduceData;

export const formatMillionNumber = (num) => {
  if (!num || num === null || num === undefined) return 0;
  let formattedNumber;

  switch (true) {
    case num >= 1e12:
      formattedNumber = (num / 1e12).toFixed(2) + "T";
      break;
    case num >= 1e9:
      formattedNumber = (num / 1e9).toFixed(2) + "B";
      break;
    case num >= 1e6:
      formattedNumber = (num / 1e6).toFixed(2) + "M";
      break;
    case num >= 1e3:
      formattedNumber = (num / 1e3).toFixed(2) + "K";
      break;
    default:
      formattedNumber = Number(num).toFixed(2); // For numbers less than 1000, keep two decimal places
      break;
  }
  return formattedNumber;
};
