import { useEffect, useState } from "react";
import { checkWalletWhitelist } from "../services/apis/validatorOnboarding";
import getValidatorByAddress from "../services/apis/getValidatorByAddress";
import {
  GENESIS_MIN_STAKE,
  GENESIS_LOCK_DAYS,
} from "../constants/validatorOnboarding";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEI = 10 ** 18;

/**
 * Resolves whether the given wallet is a whitelisted Genesis Validator and,
 * if so, whether its stake is still inside the GENESIS_LOCK_DAYS (450 day)
 * lock window measured from the validator's creation date.
 *
 * While the lock is active a Genesis Validator:
 *   - cannot stop validating, and
 *   - may only unbond the stake held ABOVE the genesis minimum stake.
 * Once the lock expires all stake becomes freely unbondable.
 *
 * `createdAt` / `selfStake` can be passed in when already available (e.g. from
 * the profile data) to avoid an extra request; otherwise they are fetched.
 */
export const useGenesisLock = ({
  walletAddress,
  createdAt,
  selfStake,
} = {}) => {
  const [isGenesis, setIsGenesis] = useState(false);
  const [resolvedCreatedAt, setResolvedCreatedAt] = useState(null);
  const [resolvedSelfStake, setResolvedSelfStake] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!walletAddress) {
      setIsGenesis(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const { isWhitelisted } = await checkWalletWhitelist(walletAddress);
        if (active) setIsGenesis(!!isWhitelisted);
      } catch {
        if (active) setIsGenesis(false);
      }

      if (createdAt == null || selfStake == null) {
        try {
          const res = await getValidatorByAddress(walletAddress);
          const validator = res?.data?.validators?.[0];
          if (active && validator) {
            if (createdAt == null) setResolvedCreatedAt(validator.createdAt);
            if (selfStake == null) setResolvedSelfStake(validator.selfStake);
          }
        } catch {
          /* leave values unresolved */
        }
      }

      if (active) setLoading(false);
    };

    run();
    return () => {
      active = false;
    };
  }, [walletAddress, createdAt, selfStake]);

  const effectiveCreatedAt = createdAt ?? resolvedCreatedAt;
  const effectiveSelfStake = selfStake ?? resolvedSelfStake;

  const selfStakeTokens = Number(effectiveSelfStake || 0) / WEI;
  const unlockDate = effectiveCreatedAt
    ? new Date(new Date(effectiveCreatedAt).getTime() + GENESIS_LOCK_DAYS * DAY_MS)
    : null;

  const now = new Date();
  const lockActive = isGenesis && unlockDate ? now < unlockDate : false;
  const daysRemaining = unlockDate
    ? Math.max(0, Math.ceil((unlockDate.getTime() - now.getTime()) / DAY_MS))
    : 0;

  // During the lock only the amount above the genesis minimum can be unbonded.
  const maxUnbondable = lockActive
    ? Math.max(0, selfStakeTokens - GENESIS_MIN_STAKE)
    : selfStakeTokens;

  return {
    isGenesis,
    lockActive,
    unlockDate,
    daysRemaining,
    minStake: GENESIS_MIN_STAKE,
    lockDays: GENESIS_LOCK_DAYS,
    selfStakeTokens,
    maxUnbondable,
    loading,
  };
};

export default useGenesisLock;
