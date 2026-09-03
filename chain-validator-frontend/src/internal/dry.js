import { getEligibleValidatorsForRewardProgram } from "../clients/http/requests";

/**
 * Check if the validator is eligible for the reward program
 * @param {string} address 
 * @returns {Promise<boolean>}
 */
export const checkValidatorEligibility = async (address) => {
    const eligibleValidators = await getEligibleValidatorsForRewardProgram();
    if (eligibleValidators.ok) {
        return eligibleValidators.data.data.eligibleValidator.some(
            (item) => item.creator.toLowerCase() === address.toLowerCase() || item.validatorAddress.toLowerCase() === address.toLowerCase());
    }
    return false;
}