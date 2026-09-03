import { BASE_URL } from "../../constants";

const getTransactionLogs = async (txHash) => {
  try {
    let nodeUrl = localStorage.getItem('node') || ''
    const response = await fetch(`${nodeUrl}/tx?hash=0x${txHash}`)
    const result = await response.json();
    return result;
  } catch (err) {
    return err
  }

}

export default getTransactionLogs;

export const getTransactionByHash = async (txHash) => {
  try {
    const response = await fetch(`${BASE_URL.VALIDATOR_API}/transactions/${txHash}`);
    const result = await response.json();
    return result;
  } catch (err) {
    return err;
  }
};

