import { BASE_URL } from "../../constants";

const getDashboardWidgets = async (address) => {
  try {
    const response = await fetch(
      `${BASE_URL.VALIDATOR_API}/validators/details?address=${address}`
    );
    if (!response.ok) {
      throw new Error();
    }
    const result = await response.json();
    return result;
  } catch (err) {
    return null;
  }
};

export default getDashboardWidgets;
