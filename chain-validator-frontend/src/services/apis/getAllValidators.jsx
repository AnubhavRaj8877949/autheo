import { BASE_URL } from "../../constants";

const getAllValidators = async (page, limit, tabId, tabName) => {
    if (tabId === 0 && !tabName) {
        const response = await fetch(`${BASE_URL.VALIDATOR_API}/validators?page=${page}&limit=${limit}`)
        if (!response.ok) {
            throw new Error();
        }
        const result = await response.json();
        return result;
    } else {
        const response = await fetch(`${BASE_URL.VALIDATOR_API}/validators?page=${page}&limit=${limit}&status=${tabName}`)
        if (!response.ok) {
            throw new Error();
        }
        const result = await response.json();
        return result;
    }

}

export default getAllValidators;
