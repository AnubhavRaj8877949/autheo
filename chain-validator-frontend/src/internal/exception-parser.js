import { EXCEPTION_CODES, EXCEPTION_MESSAGES, USER_ACTION_CODES, USER_ACTION_MESSAGES } from "../constants";

/**
 * Utility class for parsing errors and exceptions.
 */
export class ExceptionParser {
    /**
     * Parse a wallet error. Delegates to category-specific wallet parsers.
     * @param {unknown} error
     * @param {string}  defaultCode
     * @returns {string}
     */
    static parseWalletException = (error, defaultCode = EXCEPTION_CODES.UNKNOWN_EXCEPTION) => {
        const code = error?.code || error?.info?.error?.code;
        if (code) {
            return (
                ExceptionParser.#parseProviderCode(code) ??
                ExceptionParser.#parseWalletConnectCode(code) ??
                ExceptionParser.#parseJsonRpcCode(code, ExceptionParser.#extractMessage(error)) ??
                defaultCode
            );
        };


        const message = ExceptionParser.#extractMessage(error);

        return (
            ExceptionParser.#parseJsonRpcCode(code, message) ??
            ExceptionParser.#parseRejection(message) ??
            ExceptionParser.#parseSessionErrors(message) ??
            ExceptionParser.#parseAccountErrors(message) ??
            ExceptionParser.#parseFundsErrors(message) ??
            ExceptionParser.#parseChainErrors(message) ??
            ExceptionParser.#parseAuthErrors(message) ??
            ExceptionParser.#parseGasErrors(message) ??
            ExceptionParser.#parseNonceErrors(message) ??
            ExceptionParser.#parsePricingErrors(message) ??
            ExceptionParser.#parseNetworkErrors(message) ??
            defaultCode
        );
    };

    /**
     * Parse a general (non-wallet) exception. Delegates to category-specific parsers.
     * @param {unknown} error
     * @param {string}  defaultCode
     * @returns {string}
     */
    static parseException = (error, defaultCode = EXCEPTION_CODES.UNKNOWN_EXCEPTION) => {
        const status = error?.status ?? error?.response?.status ?? error?.statusCode;
        const message = ExceptionParser.#extractMessage(error);

        return (
            ExceptionParser.#parseHttpStatus(status) ??
            ExceptionParser.#parseNetworkErrors(message) ??
            ExceptionParser.#parseAuthorizationErrors(message) ??
            ExceptionParser.#parseContractErrors(message) ??
            ExceptionParser.#parseValidationErrors(message) ??
            ExceptionParser.#parseDataErrors(message) ??
            ExceptionParser.#parseStakingErrors(message) ??
            defaultCode
        );
    };

    /**
     * Resolve a human-readable message for a given error code.
     * @param {string} code
     * @returns {string}
     */
    static getMessage = (code) => {
        return (
            USER_ACTION_MESSAGES[code] ??
            EXCEPTION_MESSAGES[code] ??
            "Something went wrong, please try again."
        );
    };


    // ─────────────────────────────────────────────────────────────────────────
    // Category parsers — wallet
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * EIP-1193 numeric codes set by MetaMask, Coinbase Wallet, and injected EVM providers.
     * @param {number|string} code
     * @returns {string|null}
     */
    static #parseProviderCode = (code) => {
        if (code === 4001 || code === "ACTION_REJECTED") return USER_ACTION_CODES.USER_REJECTED;
        if (code === 4100) return USER_ACTION_CODES.UNAUTHORIZED;
        if (code === 4200) return EXCEPTION_CODES.UNSUPPORTED_METHOD;
        if (code === 4900 || code === 4901) return USER_ACTION_CODES.WALLET_DISCONNECTED;
        return null;
    };

    /**
     * WalletConnect v2 session error codes.
     * https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes
     * @param {number} code
     * @returns {string|null}
     */
    static #parseWalletConnectCode = (code) => {
        if (code === 5000 || code === 5001 || code === 5002) return USER_ACTION_CODES.USER_REJECTED;
        if (code === 5100) return USER_ACTION_CODES.CHAIN_MISMATCH;
        if (code === 5101 || code === 5102) return EXCEPTION_CODES.UNSUPPORTED_METHOD;
        if (code === 6000 || code === 6001) return USER_ACTION_CODES.WALLET_DISCONNECTED;
        return null;
    };

    /**
     * JSON-RPC server error codes (-32xxx) with message sub-inspection.
     * @param {number} code
     * @param {string} message
     * @returns {string|null}
     */
    static #parseJsonRpcCode = (code, message) => {
        if (code === -32002) return USER_ACTION_CODES.UNAUTHORIZED;
        if (code === -32000) {
            if (message.includes("insufficient funds") || message.includes("insufficient balance")) return USER_ACTION_CODES.INSUFFICIENT_FUNDS;
            if (message.includes("nonce too low") || message.includes("nonce too high") || message.includes("invalid nonce")) return EXCEPTION_CODES.NONCE_MISMATCH;
            if (message.includes("gas required exceeds") || message.includes("out of gas") || message.includes("gas estimation")) return EXCEPTION_CODES.GAS_ESTIMATION_FAILED;
            if (message.includes("transaction underpriced") || message.includes("fee too low") || message.includes("max fee per gas")) return USER_ACTION_CODES.TRANSACTION_UNDERPRICED;
        }
        return null;
    };

    /**
     * User rejection messages — Keplr, Cosmostation, Leap, MetaMask.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseRejection = (message) => {
        if (
            message.includes("request rejected") ||
            message.includes("user rejected") ||
            message.includes("rejected by user") ||
            message.includes("user denied") ||
            message.includes("rejected")
        ) return USER_ACTION_CODES.USER_REJECTED;
        return null;
    };

    /**
     * WalletConnect session and pairing expiry / disconnection messages.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseSessionErrors = (message) => {
        if (
            message.includes("session expired") ||
            message.includes("session disconnected") ||
            message.includes("session not found") ||
            message.includes("pairing expired") ||
            message.includes("disconnected") ||
            message.includes("not connected") ||
            message.includes("connection dropped")
        ) return USER_ACTION_CODES.WALLET_DISCONNECTED;
        return null;
    };

    /**
     * Keplr / Cosmos account or key not found in wallet.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseAccountErrors = (message) => {
        if (
            message.includes("key does not exist") ||
            message.includes("unknown account") ||
            message.includes("account not found")
        ) return USER_ACTION_CODES.UNAUTHORIZED;
        return null;
    };

    /**
     * Insufficient balance errors.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseFundsErrors = (message) => {
        if (
            message.includes("insufficient funds") ||
            message.includes("insufficient balance") ||
            (message.includes("not enough") && message.includes("balance"))
        ) return USER_ACTION_CODES.INSUFFICIENT_FUNDS;
        return null;
    };

    /**
     * Wrong network / chain ID mismatch — Keplr, MetaMask, WalletConnect.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseChainErrors = (message) => {
        if (
            message.includes("chain mismatch") ||
            message.includes("wrong network") ||
            message.includes("wrong chain") ||
            message.includes("switch network") ||
            message.includes("chain not added") ||
            message.includes("unrecognized chain") ||
            message.includes("there is no chain info") ||
            message.includes("chain not approved")
        ) return USER_ACTION_CODES.CHAIN_MISMATCH;
        return null;
    };

    /**
     * Unauthorized / locked wallet messages.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseAuthErrors = (message) => {
        if (
            message.includes("unauthorized") ||
            (message.includes("locked") && message.includes("wallet")) ||
            message.includes("access denied")
        ) return USER_ACTION_CODES.UNAUTHORIZED;
        return null;
    };

    /**
     * Gas estimation / execution failure messages.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseGasErrors = (message) => {
        if (
            message.includes("gas required exceeds") ||
            message.includes("out of gas") ||
            message.includes("gas estimation failed") ||
            message.includes("cannot estimate gas") ||
            message.includes("unpredictable gas limit")
        )
            return EXCEPTION_CODES.GAS_ESTIMATION_FAILED;
        else if (message.includes("insufficient fee"))
            return EXCEPTION_CODES.INSUFFICIENT_FEE;
        return null;
    };

    /**
     * Nonce mismatch / replacement errors.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseNonceErrors = (message) => {
        if (
            message.includes("nonce too low") ||
            message.includes("nonce too high") ||
            message.includes("invalid nonce") ||
            message.includes("replacement transaction underpriced")
        ) return EXCEPTION_CODES.NONCE_MISMATCH;
        return null;
    };

    /**
     * Transaction underpriced / gas price too low messages.
     * @param {string} message
     * @returns {string|null}
     */
    static #parsePricingErrors = (message) => {
        if (
            message.includes("underpriced") ||
            message.includes("fee too low") ||
            (message.includes("base fee") && message.includes("exceeds"))
        ) return USER_ACTION_CODES.TRANSACTION_UNDERPRICED;
        return null;
    };


    // ─────────────────────────────────────────────────────────────────────────
    // Category parsers — general
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * HTTP response status codes.
     * @param {number|undefined} status
     * @returns {string|null}
     */
    static #parseHttpStatus = (status) => {
        if (!status) return null;
        if (status === 401) return EXCEPTION_CODES.AUTHORIZATION_ERROR;
        if (status === 403) return EXCEPTION_CODES.AUTHORIZATION_ERROR;
        if (status === 404) return EXCEPTION_CODES.NOT_FOUND;
        if (status === 408 || status === 504) return EXCEPTION_CODES.NETWORK_ERROR;
        if (status === 422) return EXCEPTION_CODES.VALIDATION_ERROR;
        if (status === 429) return EXCEPTION_CODES.RATE_LIMITED;
        if (status === 500 || status === 502 || status === 503) return EXCEPTION_CODES.SERVER_ERROR;
        return null;
    };

    /**
     * Network / connectivity failure messages — shared by both orchestrators.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseNetworkErrors = (message) => {
        if (
            message.includes("failed to fetch") ||
            message.includes("network error") ||
            message.includes("network request failed") ||
            message.includes("econnrefused") ||
            message.includes("econnreset") ||
            message.includes("etimedout") ||
            message.includes("timeout") ||
            message.includes("no internet") ||
            message.includes("dns lookup failed")
        ) return EXCEPTION_CODES.NETWORK_ERROR;
        return null;
    };

    /**
     * Staking operation error messages — delegation, redelegation, unbonding, cancel.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseStakingErrors = (message) => {
        if (
            message.includes("cancel unbonding failed") ||
            message.includes("failed to cancel unbonding") ||
            message.includes("cancel unbond")
        ) return EXCEPTION_CODES.UNBONDING_CANCEL_FAILED;

        if (
            message.includes("redelegation failed") ||
            message.includes("failed to redelegate") ||
            message.includes("cannot redelegate") ||
            message.includes("begin redelegate")
        ) return EXCEPTION_CODES.RE_DELEGATION_FAILED;

        if (
            message.includes("delegation failed") ||
            message.includes("failed to delegate") ||
            message.includes("cannot delegate")
        ) return EXCEPTION_CODES.DELEGATION_FAILED;

        if (
            message.includes("unbonding failed") ||
            message.includes("failed to unbond") ||
            message.includes("cannot unbond") ||
            message.includes("undelegate")
        ) return EXCEPTION_CODES.UNDELEGATION_FAILED;

        return null;
    };

    /**
     * Contract execution revert errors — Ethers, Cosmos tx failure.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseContractErrors = (message) => {
        if (
            message.includes("execution reverted") ||
            message.includes("transaction reverted") ||
            message.includes("revert") ||
            message.includes("call exception") ||
            message.includes("contract call failed") ||
            message.includes("failed with error") ||
            message.includes("evm error")
        ) return EXCEPTION_CODES.CONTRACT_REVERTED;
        return null;
    };

    /**
     * Input validation errors — invalid address, amount, format.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseValidationErrors = (message) => {
        if (
            message.includes("invalid address") ||
            message.includes("invalid amount") ||
            message.includes("invalid parameter") ||
            message.includes("invalid argument") ||
            message.includes("invalid input") ||
            message.includes("validation failed") ||
            message.includes("required field") ||
            message.includes("must be greater than") ||
            message.includes("must be a valid")
        ) return EXCEPTION_CODES.VALIDATION_ERROR;
        return null;
    };

    /**
     * Malformed / unexpected data errors — JSON parse failures, bad response shape.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseDataErrors = (message) => {
        if (
            message.includes("json parse error") ||
            message.includes("unexpected token") ||
            message.includes("unexpected end of json") ||
            message.includes("invalid json") ||
            message.includes("malformed response") ||
            message.includes("invalid response")
        ) return EXCEPTION_CODES.INVALID_DATA;
        return null;
    };

    /**
     * API / backend authorization errors — API key, permission denied.
     * @param {string} message
     * @returns {string|null}
     */
    static #parseAuthorizationErrors = (message) => {
        if (
            message.includes("forbidden") ||
            message.includes("permission denied") ||
            message.includes("not authorized") ||
            message.includes("api key") ||
            message.includes("invalid token") ||
            message.includes("token expired")
        ) return EXCEPTION_CODES.AUTHORIZATION_ERROR;
        return null;
    };


    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Extract and normalize an error message from multiple possible fields.
     * @param {unknown} error
     * @returns {string}
     */
    static #extractMessage = (error) => {
        return (
            error?.message ??
            error?.data?.message ??
            error?.response?.data?.message ??
            error?.reason ??
            error?.toString() ??
            ""
        ).toLowerCase();
    };
}
