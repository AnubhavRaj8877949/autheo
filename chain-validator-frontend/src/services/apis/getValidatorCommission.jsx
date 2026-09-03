import { ChainConfig } from "../../constants";

const getValidatorCommission = async (validatorAddress) => {
  try {
    if (!validatorAddress) return { error: true, message: "Validator address is required" };
    const response = await fetch(
      `${ChainConfig.rest}/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return { error: false, data: result };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export default getValidatorCommission;
