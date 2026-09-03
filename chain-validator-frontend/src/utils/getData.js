const getData = (data = '', startLen = 10, endLen = 10) => {
  return `${data?.substring(0, startLen)}...${data?.substring(data?.length - endLen, data?.length)}`;
};

export default getData;
