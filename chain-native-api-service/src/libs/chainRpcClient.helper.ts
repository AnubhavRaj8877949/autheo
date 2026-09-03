import { fromBase64 } from "@cosmjss/encoding";
import { anyToSinglePubkey } from "@cosmjss/proto-signing";
import { QueryClient, setupStakingExtension } from "@cosmjss/stargate";
import { pubkeyToAddress, Tendermint37Client } from "@cosmjss/tendermint-rpc";
import { assert } from "@cosmjss/utils";
import { bech32 } from "bech32";
import { sanitizeUrl } from "./utilities/common";
import logger from "./logger";

export class ChainRpcClient {
  private static instance: ChainRpcClient;

  private tendermintClient: Tendermint37Client;

  public static getInstance(): ChainRpcClient {
    if (!ChainRpcClient.instance) {
      ChainRpcClient.instance = new ChainRpcClient();
    }
    return ChainRpcClient.instance;
  }

  public async connect() {
    const rpcUrl = environment.nativeRpcHttpUrl;
    const timeoutMs = environment.rpcTimeoutMs;
    try {
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(new Error(`RPC connection timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      });
      this.tendermintClient = await Promise.race([
        Tendermint37Client.connect(rpcUrl),
        timeout,
      ]);
      logger.info("Chain RPC client connected", { host: sanitizeUrl(rpcUrl) });
      return true;
    } catch (error) {
      logger.error("Failed to connect to RPC", {
        host: sanitizeUrl(rpcUrl),
        error,
      });
      return false;
    }
  }

  public async consensusAddressToOperatorAddress(consensusAddress: string) {
    try {
      if (!this.tendermintClient) {
        await this.connect();
      }
      const queryClient = QueryClient.withExtensions(
        this.tendermintClient,
        setupStakingExtension,
      );
      const consensusToOperator = new Map<string, string>();
      let nextKey: Uint8Array | undefined;
      do {
        const res = await queryClient.staking.validators(
          "BOND_STATUS_BONDED",
          nextKey,
        );
        res.validators.forEach((r) => {
          assert(r.consensusPubkey);
          const pubkey = anyToSinglePubkey(r.consensusPubkey);
          const address = pubkeyToAddress("ed25519", fromBase64(pubkey.value));
          consensusToOperator.set(address, r.operatorAddress);
        });
        nextKey = res.pagination?.nextKey;
      } while (nextKey?.length);
      return consensusToOperator.get(consensusAddress) ?? "";
    } catch (err) {
      logger.error("Error in consensusAddressToOperatorAddress:", err);
      return "";
    }
  }

  public async getDelegatorAddress(operatorAddr: string) {
    try {
      const address = bech32.decode(operatorAddr);
      return bech32.encode(environment.addressPrefix, address.words);
    } catch (err) {
      logger.error("Error in getDelegatorAddress:", err);
      return "";
    }
  }
}
