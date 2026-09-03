import { AxiosInstance, AxiosResponse } from "axios";
import { FETCH_METHODS, HEADERS, RES_MSG } from "../constant";
import { IProposalData } from "../interface";
import { fetchRequest, computeTallyStats } from "./utility/common";
import dbHelper from "./db.helper";

// Terminal states whose tally/turnout must be frozen and never recomputed.
const TERMINAL_STATUSES = [RES_MSG.PASSED, RES_MSG.REJECTED, RES_MSG.FAILED];

/**
 *  Process and update information for each proposal
 * @param apiRes
 * @returns
 */
async function getProposalsInfo(apiRes: AxiosInstance) {
  try {
    const response: AxiosResponse = await apiRes.get(
      "/cosmos/gov/v1/proposals?proposal_status=PROPOSAL_STATUS_UNSPECIFIED",
    );

    const proposals: IProposalData[] = [];

    const finalizedIds = await dbHelper.getFinalizedProposalIds();

    let bondedTokens = "0";
    try {
      const poolRes = await apiRes.get("/cosmos/staking/v1beta1/pool");
      bondedTokens = poolRes?.data?.pool?.bonded_tokens ?? "0";
    } catch (err) {
      // fall back to "0" -> turnout becomes "0" rather than crashing the run
    }

    // Historical, already-frozen proposals are dropped up-front so their
    // stored values are never refetched, recomputed or overwritten.
    const pendingProposals = (response?.data?.proposals ?? []).filter(
      (proposal: any) => !finalizedIds.has(proposal?.id),
    );

    for (let i = 0; i < pendingProposals.length; i++) {
      const proposal = pendingProposals[i];

      let status = RES_MSG.FAILED;

      switch (proposal?.status) {
        case RES_MSG.PROPOSAL_STATUS_DEPOSIT_PERIOD:
          status = RES_MSG.DEPOSIT_PERIOD;
          break;
        case RES_MSG.PROPOSAL_STATUS_VOTING_PERIOD:
          status = RES_MSG.VOTING_PERIOD;
          break;
        case RES_MSG.PROPOSAL_STATUS_PASSED:
          status = RES_MSG.PASSED;
          break;
        case RES_MSG.PROPOSAL_STATUS_REJECTED:
          status = RES_MSG.REJECTED;
          break;
        case RES_MSG.PROPOSAL_STATUS_FAILED:
          status = RES_MSG.FAILED;
          break;
        default:
          break;
      }

      const amountObj = proposal.total_deposit.find(
        (item: any) =>
          item?.denom === (environment?.symbol ?? "").toLowerCase(),
      );

      const messageType = proposal?.messages[0]?.["@type"];

      const proposalId = proposal?.id;

      const url = `${environment.nativeSwaggerUrl}/cosmos/gov/v1/proposals/${proposalId}/tally`;
      const tallyData = await fetchRequest(
        url,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null,
      );

      const proposalData: IProposalData = {
        proposalId,
        status,
        metaData: proposal?.metadata,
        title: proposal?.title,
        summary: proposal?.summary,
        proposer: proposal?.proposer,
        totalDeposit: amountObj?.amount,
        proposerType: messageType || "",
        tally: JSON.stringify(tallyData?.data?.tally),
        votingStartTime: proposal?.voting_start_time,
        votingEndTime: proposal?.voting_end_time,
      };


      if (TERMINAL_STATUSES.includes(status)) {

        const finalTally =
          proposal?.final_tally_result ?? tallyData?.data?.tally;

        const stats = computeTallyStats(finalTally, bondedTokens);

        proposalData.tally = JSON.stringify(finalTally);
        proposalData.bondedTokens = bondedTokens;
        proposalData.totalVotes = stats.totalVotes;
        proposalData.turnout = stats.turnout;
        proposalData.yesPercent = stats.yesPercent;
        proposalData.noPercent = stats.noPercent;
        proposalData.abstainPercent = stats.abstainPercent;
        proposalData.vetoPercent = stats.vetoPercent;
        proposalData.isFinalized = true;
      }

      await dbHelper.saveProposals(proposalData);

      proposals.push(proposalData);
    }
    return proposals;
  } catch (err) {
    if (err instanceof Error) {
      return { error: true, message: err.message };
    }
    return {
      error: true,
      message: RES_MSG.PROPOSAL_ERROR,
    };
  }
}

export { getProposalsInfo };
