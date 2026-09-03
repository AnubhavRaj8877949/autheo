import { getEligibleValidatorsForRewardProgram } from "../clients/http/requests";

/**
 * Check if the validator is eligible for the reward program.
 *
 * NOTE: eligibility is an optional flag - a node that does not expose the
 * validatorbonus module (or answers with an unexpected body) must not break
 * login, so every failure here resolves to `false` instead of throwing.
 *
 * @param {string} address
 * @returns {Promise<boolean>}
 */
export const checkValidatorEligibility = async (address) => {
    if (!address) return false;

    try {
        const eligibleValidators = await getEligibleValidatorsForRewardProgram();
        if (!eligibleValidators?.ok) return false;

        const list = eligibleValidators?.data?.data?.eligibleValidator;
        if (!Array.isArray(list)) return false;

        const target = address.toLowerCase();
        return list.some(
            (item) =>
                item?.creator?.toLowerCase() === target ||
                item?.validatorAddress?.toLowerCase() === target,
        );
    } catch {
        return false;
    }
};
