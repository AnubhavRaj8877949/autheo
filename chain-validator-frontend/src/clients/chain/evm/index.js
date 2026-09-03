import { ethers } from "ethers";
import { APP_NAME, CHAIN_ID, EXCEPTION_CODES, GENESIS_FACTORY_ABI, GENESIS_FACTORY_ADDRESS, GENESIS_FACTORY_METHODS, ChainConfig, CHAIN_REST_API_URL, TENDERMINT_RPC, WALLET_TYPE } from "../../../constants";
import { Exception, Response, Result } from "../../../internal";


export const SIGNING_TYPES = {
    TRANSACTION: "transaction",
    MESSAGE: "message"
}


export class SignerWrapper {
    #signer;
    #type;
    #chainId;
    #address;

    constructor(signer, type, chainId, address) {
        this.#signer = signer;
        this.#type = type;
        this.#chainId = chainId;
        this.#address = address;
    };


    /**
     * Returns the address of the signer
     * @returns {string} address
     */
    getAddress = () => {
        return this.#address;
    };


    /**
     * Adds the custom evm chain
     * (experimental)
     */
    addChain = async () => {
        if (this.#type === WALLET_TYPE.KEPLR) {
            await this.#signer.experimentalSuggestChain({
                chainId: ChainConfig.chainId,
                chainName: APP_NAME,
                rpc: TENDERMINT_RPC,
                rest: CHAIN_REST_API_URL,
                bip44: ChainConfig.bip44,
                bech32Config: ChainConfig.bech32Config,
                currencies: ChainConfig.currencies,
                feeCurrencies: ChainConfig.feeCurrencies,
                stakeCurrency: ChainConfig.stakeCurrency,
            });
        }
    }

    signTransaction = async (txn) => {
        if (this.#type === WALLET_TYPE.KEPLR) {
            const provider = new ethers.BrowserProvider(this.#signer.ethereum);
            const signer = await provider.getSigner();
            return await signer.signTransaction(txn);
        } else {
            return await this.#signer.signTransaction(txn);
        }
    };

}


export class CallData {
    #abi;
    #method;
    #args = [];

    /**
     * @param {any[]} abi 
     */
    constructor(abi = null) {
        this.#abi = abi;
    }

    /**
     * Sets the ABI for the call data
     * @param {any[]} abi 
     * @returns {CallData}
     */
    abi = (abi) => {
        this.#abi = abi;
        return this;
    }

    /**
     * Sets the method name for the call data
     * @param {string} method 
     * @returns {CallData}
     */
    method = (method) => {
        this.#method = method;
        return this;
    }

    /**
     * Sets the arguments for the method
     * @param {any[]} args 
     * @returns {CallData}
     */
    args = (args) => {
        this.#args = args;
        return this;
    }

    /**
     * Builds the encoded call data
     * @returns {string} Encoded hex string
     */
    build = () => {
        if (!this.#abi) {
            throw new Error("ABI is required to build call data");
        }
        if (!this.#method) {
            throw new Error("Method name is required to build call data");
        }

        const iface = new ethers.Interface(this.#abi);
        return iface.encodeFunctionData(this.#method, this.#args);
    }
}

export class Transaction {
    #to;
    #value;
    #data;
    #gasLimit;
    #gasPrice;
    #maxFeePerGas;
    #maxPriorityFeePerGas;
    #nonce;
    #type;
    #chainId;

    /**
     * Sets the recipient address
     * @param {string} to 
     * @returns {Transaction}
     */
    to = (to) => {
        this.#to = to;
        return this;
    }

    /**
     * Sets the value in wei
     * @param {bigint | string} value 
     * @returns {Transaction}
     */
    value = (value) => {
        this.#value = value;
        return this;
    }

    /**
     * Sets the hex data for the transaction
     * @param {string} data 
     * @returns {Transaction}
     */
    data = (data) => {
        this.#data = data;
        return this;
    }

    /**
     * Sets the chain ID
     * @param {string} chainId 
     * @returns {Transaction}
     */
    chainId = (chainId) => {
        this.#chainId = chainId;
        return this;
    }

    /**
     * Sets the gas limit
     * @param {bigint | number} gasLimit 
     * @returns {Transaction}
     */
    gasLimit = (gasLimit) => {
        this.#gasLimit = gasLimit;
        return this;
    }

    /**
     * Sets the gas price
     * @param {bigint | string} gasPrice 
     * @returns {Transaction}
     */
    gasPrice = (gasPrice) => {
        this.#gasPrice = gasPrice;
        return this;
    }

    /**
     * Sets the max fee per gas (EIP-1559)
     * @param {bigint | string} maxFeePerGas 
     * @returns {Transaction}
     */
    maxFeePerGas = (maxFeePerGas) => {
        this.#maxFeePerGas = maxFeePerGas;
        return this;
    }

    /**
     * Sets the max priority fee per gas (EIP-1559)
     * @param {bigint | string} maxPriorityFeePerGas 
     * @returns {Transaction}
     */
    maxPriorityFeePerGas = (maxPriorityFeePerGas) => {
        this.#maxPriorityFeePerGas = maxPriorityFeePerGas;
        return this;
    }

    /**
     * Sets the nonces
     * @param {number} nonce 
     * @returns {Transaction}
     */
    nonce = (nonce) => {
        this.#nonce = nonce;
        return this;
    }

    /**
     * Sets the transaction type
     * @param {number} type 
     * @returns {Transaction}
     */
    type = (type) => {
        this.#type = type;
        return this;
    }

    /**
     * Builds the transaction request object
     * @returns {import("ethers").TransactionRequest}
     */
    build = () => {
        const tx = {
            to: this.#to,
            value: this.#value,
            data: this.#data,
            nonce: this.#nonce,
            chainId: this.#chainId
        };

        if (this.#type !== undefined) tx.type = this.#type;

        /**
         * Helper to safely format hex strings
         * @param {bigint | number | string} val 
         * @returns {string | undefined}
         */
        const toHex = (val) => {
            if (val === undefined || val === null) return undefined;
            try {
                return ethers.toBeHex(val);
            } catch (e) {
                return undefined;
            }
        };

        if (this.#gasLimit !== undefined) tx.gasLimit = toHex(this.#gasLimit);

        // Infer type if NOT provided
        const isType2 = this.#type === 2 || (this.#type === undefined && (this.#maxFeePerGas !== undefined || this.#maxPriorityFeePerGas !== undefined));

        if (isType2 && this.#maxFeePerGas && this.#maxPriorityFeePerGas) {
            // EIP-1559 (Type 2)
            const maxFee = toHex(this.#maxFeePerGas);
            const priorityFee = toHex(this.#maxPriorityFeePerGas);

            if (maxFee) tx.maxFeePerGas = maxFee;
            if (priorityFee) tx.maxPriorityFeePerGas = priorityFee;

            // In Type 2, gasPrice is usually NOT included, but we permit it if provided
            if (this.#gasPrice !== undefined) tx.gasPrice = toHex(this.#gasPrice);
        } else if (this.#gasPrice) {
            // Legacy (Type 0 / 1)
            if (this.#gasPrice !== undefined) tx.gasPrice = toHex(this.#gasPrice);
        }

        return tx;
    }

    /**
     * Signs the transaction using the provided signer
     * @param {import("ethers").Signer} signer 
     * @returns {Promise<string>} Signed transaction hex string
     */
    sign = async (signer) => {
        return await signer.signTransaction(this.build());
    }
}

/**
 * Wrapper class around the evm contract
 */
export class Contract {
    contract;
    contractReadOnly;
    signer;
    provider;
    abi;
    address;
    isRawSigner = false;
    rawSigner;
    walletAddress;

    constructor(address, abi, provider, signer = null) {
        this.provider = provider;
        this.contractReadOnly = new ethers.Contract(address, abi, provider);
        this.signer = signer;
        this.address = address;
        this.abi = abi;
        if (signer) {
            this.contract = new ethers.Contract(address, abi, signer);
        }
    };


    /**
     * Initialize the raw signer 
     * @param {SignerWrapper} signer 
     */
    initRawSigner = (signer) => {
        this.isRawSigner = true;
        this.rawSigner = signer;
        this.walletAddress = signer.getAddress();
    }

    /**
     * Initialize the contract with the signer
     * @param {JsonRpcSigner} signer 
     */
    initSigner = (signer) => {
        this.signer = signer;
        this.contract = new ethers.Contract(this.address, this.abi, signer);
    }

    prepareContractTransaction = async (method, args) => {
        const callData = new CallData(this.abi).method(method).args(args).build();
        const nonce = await this.provider.getTransactionCount(this.walletAddress);
        const gasLimit = await this.estimateGas(method, args);

        const txnRequest = new Transaction()
            .to(this.address)
            .data(callData)
            .gasLimit(gasLimit)
            .type(2)
            .maxFeePerGas(1500000000000n) // TODO: default gas price is hardcoded, need the inject using env
            .maxPriorityFeePerGas(1500000000000n)
            .chainId(CHAIN_ID)
            .nonce(nonce).build();
        return txnRequest;
    };

    /**
     * Sign transaction using the current initialized raw signer
     * @param {import("ethers").TransactionRequest} txnRequest 
     * @returns {Promise<string>}
     */
    signTransaction = async (txnRequest) => {
        return await this.rawSigner.signTransaction(txnRequest);
    };

    /**
     * Send transaction to network
     * @param {string} signedTxn 
     * @returns {Promise<TransactionReceipt>}
     */
    sendTransaction = async (signedTxn) => {
        const tx = await this.provider.broadcastTransaction(signedTxn);
        return (await tx.wait());
    };

    /**
     * Sign transaction using the current initialized raw signer
     * @param {string} method 
     * @param {any[]} args 
     * @returns {Promise<string>}
     */
    signContractTransaction = async (method, args) => {
        const txnRequest = await this.prepareContractTransaction(method, args);
        const txnSig = await this.signTransaction(txnRequest);
        return txnSig;
    };

    /**
     * Sign the transaction using the initialized raw signer and 
     * send it to the network using the provider
     * @param {string} method 
     * @param {any[]} args 
     * @returns {Promise<TransactionReceipt>}
     */
    signAndSendContractTransaction = async (method, args) => {
        const signedTxn = await this.signContractTransaction(method, args);
        const txnReceipt = await this.sendTransaction(signedTxn);
        return txnReceipt;
    }

    /**
     * Send the transaction using the signer
     * @param {string} method 
     * @param {any[]} args 
     * @returns {Promise<any>}
     */
    sendContractTransaction = async (method, args) => {
        if (this.isRawSigner) {
            const tx = await this.signAndSendContractTransaction(method, args);
            return tx;
        } else {
            const tx = await this.contract[method](...args);
            await tx.wait();
            return tx;
        }
    };

    /**
     * Call the read only methods of smart contract
     * @param {string} method 
     * @param {any[]} args 
     * @returns {Promise<any>}
     */
    call = async (method, args) => {
        const tx = await this.contractReadOnly[method].staticCall(...args);
        return tx;
    };

    /**
     * Estimate gas for specific method
     * @param {string} method 
     * @param {any[]} args 
     * @param {string} address 
     * @returns {Promise<bigint>}
     */
    estimateGas = async (method, args, address = this.walletAddress) => {
        const gas = await this.contractReadOnly[method].estimateGas(...args, { from: address });
        return gas;
    };
};


export class GenesisFactory extends Contract {
    static #instance;

    constructor(provider, signer = null) {
        if (!GenesisFactory.#instance) {
            super(GENESIS_FACTORY_ADDRESS, GENESIS_FACTORY_ABI, provider, signer);
            GenesisFactory.#instance = this;
        }
        return GenesisFactory.#instance;
    }

    static getInstance = () => {
        return this.#instance;
    }

    static destroyInstance = () => {
        this.#instance = null;
    }

    /**
     * Check if the validator has initiated the reward program
     * @returns {Promise<Result<Response, Exception>>}
     */
    checkInitiationStatus = async (address) => {
        try {
            const status = await this.call(GENESIS_FACTORY_METHODS.getTheVestingContractAddress, [address]);
            return new Result(new Response(status));
        } catch (err) {
            return new Result(null, false, new Exception(err, EXCEPTION_CODES.VESTING_INITIATION_CHECKING_FAILED));
        }
    };

    /**
     * Check if the validator has initiated the reward program
     * @returns {Promise<Result<Response, Exception>>}
     */
    initiateVesting = async () => {
        try {
            const status = await this.sendContractTransaction(GENESIS_FACTORY_METHODS.initiateVesting, []);
            return new Result(new Response(status));
        } catch (err) {
            return new Result(null, false, new Exception(err, EXCEPTION_CODES.VESTING_INITIATION_FAILED));
        }
    };


};