import { BASE_URL } from "../../constants";
import { getNativeAddress } from "../showEVMAddress";

const getValidatorByAddress = async (value, page, limit) => {
  try {
    let valAddress = value?.trim();

    if (valAddress.startsWith("0x")) {
      valAddress = getNativeAddress(valAddress);
    }
    const response = page
      ? await fetch(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=${valAddress}&page=${page}&limit=${limit}`
      )
      : await fetch(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=${valAddress}`
      );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    //console.error("Error fetching blocks:", error);
    return { error: true, message: error.message };
  }
};
export default getValidatorByAddress;
