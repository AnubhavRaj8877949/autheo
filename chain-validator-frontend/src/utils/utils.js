/*eslint-disable */
const jObj = (v) => JSON.parse(v);
const jStr = (v) => JSON.stringify(v);
const toB64 = (s) => btoa(s);
const eHandle = (e) => e.preventDefault() || !0;
const isArr = (a) => a instanceof Array;
const isObj = (o) => typeof o === 'object';
const isStr = (s) => typeof s === 'string';
const isNum = (s) => typeof s === 'number';

const jObject = (s) => JSON.parse(s);

const jString = (o) => JSON.stringify(o);

function rEqual(a, b) {
  return isStr(a) && isStr(b)
    ? a.toLowerCase() === b.toLowerCase()
    : isNum(a) && isNum(b)
    ? a === b
    : (isStr(a) && isNum(b)) || (isStr(b) && isNum(a))
    ? a == b
    : !1;
}

const notEqual = (a, b) => !rEqual(a, b);
export { isObj, isStr, jObj, jStr, rEqual, notEqual };
