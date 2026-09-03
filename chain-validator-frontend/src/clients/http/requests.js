import requestHandler, { HttpRequest } from './index';
import { CHAIN_REST_API_URL } from '../../constants';

/**
 * Fetches eligible validators for the validator reward program
 * @returns {Promise<Result>}
 */
export const getEligibleValidatorsForRewardProgram = () => {
    // NOTE: `/blockmaze/...` is the chain's own REST module route, not app
    // branding. It is part of the backend contract and must match whatever
    // the connected node exposes - do not rename it as part of a rebrand.
    const url = `${CHAIN_REST_API_URL}/blockmaze/validatorbonus/eligible_validator`;
    const request = new HttpRequest(url)
        .setMethod('get')
        .build();

    return requestHandler.execute(request);
};
