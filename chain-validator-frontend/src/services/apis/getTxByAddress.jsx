import { BASE_URL } from "../../constants";

const getTxByAddress = async (address, page, limit) => {
    const response = await fetch(`${BASE_URL.VALIDATOR_API}/transactions/address?page=${page}&limit=${limit}&address=${address}`)
    const result = await response.json();
    return result;
}

export default getTxByAddress;
