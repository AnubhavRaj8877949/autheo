import { BASE_URL } from "../constants";

const getPrice = async () => {
  const response = await fetch(
    `${BASE_URL.EXPLORER_API_URL}/explorer/current-token-price`
  );
  const result = await response.json();
  return result;
};
export default getPrice;
