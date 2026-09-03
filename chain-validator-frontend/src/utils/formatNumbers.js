const trimTrailingZeros = (s) => {
  if (!s.includes('.')) return s;
  let end = s.length;
  while (end > 0 && s[end - 1] === '0') end--;
  if (end > 0 && s[end - 1] === '.') end--;
  return s.slice(0, end);
};

export const formatCompact = (number) => {
  const n = Number(number);
  if (Number.isNaN(n)) return String(number);
  if (n >= 1_000_000_000) return `${trimTrailingZeros((n / 1_000_000_000).toFixed(2))}B`;
  if (n >= 1_000_000)     return `${trimTrailingZeros((n / 1_000_000).toFixed(2))}M`;
  if (n >= 1_000)         return `${trimTrailingZeros((n / 1_000).toFixed(2))}K`;
  return String(n);
};

export const formatNumbers = (number, numberOfDecimals = 2) => {
  if (number === '') return '';

  const decimalsToUse = numberOfDecimals === 0 ? 0 : numberOfDecimals;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalsToUse,
    maximumFractionDigits: decimalsToUse,
  }).format(number);
};
