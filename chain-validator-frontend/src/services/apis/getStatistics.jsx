import { BASE_URL } from "../../constants";

const getAllStats = async () => {
  try {
    const response = await fetch(
      `${BASE_URL.VALIDATOR_API}/stats/summary`
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

export default getAllStats;
