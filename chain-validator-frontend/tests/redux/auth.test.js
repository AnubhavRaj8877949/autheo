import authReducer, {
    checkIfValidatorExist,
    checkIfValidatorExistInBlockchain,
    logInSuccess,
    isTxOccur,
    getValoperAddress,
    getValoperAddressFromBlockChain,
    getBondedBalance,
    getTotalValidators,
    getWalletBalance,
    getValidatorCount,
    getEvmAddress,
    getWalletType,
    logout,
    getApy,
} from "../../src/redux/reducer/auth";
import { GLOBAL_OBJECT } from "../testConstants";

describe("auth reducer", () => {
    const initialState = {
        loading: false,
        isLoggedIn: false,
        isValidated: false,
        userAddress: "",
        isEligibleForRewardProgram: false,
        isTx: false,
        valoperAddress: "",
        valoperAddressFromBlockChain: "",
        isValidatedInBlockchain: false,
        totalValidators: "",
        userBalance: "",
        APY: "",
        time: "",
        bondedBalance: {
            bondedAmount: "",
            unbondedAmount: "",
        },
        validatorCount: 0,
        userEvmAddress: "",
        walletType: "",
    };

    it("should return the initial state", () => {
        expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    describe("checkIfValidatorExist", () => {
        it("should set isValidated to true", () => {
            const actual = authReducer(initialState, checkIfValidatorExist(true));
            expect(actual.isValidated).toBe(true);
        });

        it("should set isValidated to false", () => {
            const actual = authReducer(initialState, checkIfValidatorExist(false));
            expect(actual.isValidated).toBe(false);
        });
    });

    describe("checkIfValidatorExistInBlockchain", () => {
        it("should set isValidatedInBlockchain to true", () => {
            const actual = authReducer(initialState, checkIfValidatorExistInBlockchain(true));
            expect(actual.isValidatedInBlockchain).toBe(true);
        });

        it("should set isValidatedInBlockchain to false", () => {
            const actual = authReducer(initialState, checkIfValidatorExistInBlockchain(false));
            expect(actual.isValidatedInBlockchain).toBe(false);
        });
    });

    describe("logInSuccess", () => {
        it("should set login state and user address", () => {
            const userAddress = `${GLOBAL_OBJECT}1abc123`;
            const actual = authReducer(initialState, logInSuccess(userAddress));

            expect(actual.loading).toBe(false);
            expect(actual.isLoggedIn).toBe(true);
            expect(actual.userAddress).toBe(userAddress);
        });
    });

    describe("isTxOccur", () => {
        it("should set isTx to true", () => {
            const actual = authReducer(initialState, isTxOccur(true));
            expect(actual.isTx).toBe(true);
        });

        it("should set isTx to false", () => {
            const actual = authReducer(initialState, isTxOccur(false));
            expect(actual.isTx).toBe(false);
        });
    });

    describe("getValoperAddress", () => {
        it("should set valoper address", () => {
            const address = "valoper1xyz";
            const actual = authReducer(initialState, getValoperAddress(address));
            expect(actual.valoperAddress).toBe(address);
        });
    });

    describe("getValoperAddressFromBlockChain", () => {
        it("should set valoper address from blockchain", () => {
            const address = "valoper1blockchain";
            const actual = authReducer(initialState, getValoperAddressFromBlockChain(address));
            expect(actual.valoperAddressFromBlockChain).toBe(address);
        });
    });

    describe("getBondedBalance", () => {
        it("should set bonded balance", () => {
            const balance = {
                bondedAmount: "1000",
                unbondedAmount: "500",
            };
            const actual = authReducer(initialState, getBondedBalance(balance));
            expect(actual.bondedBalance).toEqual(balance);
        });
    });

    describe("getTotalValidators", () => {
        it("should set total validators", () => {
            const total = "150";
            const actual = authReducer(initialState, getTotalValidators(total));
            expect(actual.totalValidators).toBe(total);
        });
    });

    describe("getWalletBalance", () => {
        it("should set user balance", () => {
            const balance = "5000";
            const actual = authReducer(initialState, getWalletBalance(balance));
            expect(actual.userBalance).toBe(balance);
        });
    });

    describe("getValidatorCount", () => {
        it("should set validator count", () => {
            const count = 42;
            const actual = authReducer(initialState, getValidatorCount(count));
            expect(actual.validatorCount).toBe(count);
        });

        it("should handle object payload", () => {
            const countData = { count: 100 };
            const actual = authReducer(initialState, getValidatorCount(countData));
            expect(actual.validatorCount).toEqual(countData);
        });
    });

    describe("getEvmAddress", () => {
        it("should set EVM address", () => {
            const evmAddress = "0x1234567890abcdef";
            const actual = authReducer(initialState, getEvmAddress(evmAddress));
            expect(actual.userEvmAddress).toBe(evmAddress);
        });
    });

    describe("getWalletType", () => {
        it("should set wallet type to keplr", () => {
            const actual = authReducer(initialState, getWalletType("keplr"));
            expect(actual.walletType).toBe("keplr");
        });

        it("should set wallet type to cosmostation", () => {
            const actual = authReducer(initialState, getWalletType("cosmostation"));
            expect(actual.walletType).toBe("cosmostation");
        });

        it(`should set wallet type to ${GLOBAL_OBJECT}`, () => {
            const actual = authReducer(initialState, getWalletType(GLOBAL_OBJECT));
            expect(actual.walletType).toBe(GLOBAL_OBJECT);
        });
    });

    describe("getApy", () => {
        it("should set APY", () => {
            const apy = "12.5";
            const actual = authReducer(initialState, getApy(apy));
            expect(actual.APY).toBe(apy);
        });
    });

    describe("logout", () => {
        it("should handle logout action", () => {
            const loggedInState = {
                ...initialState,
                isLoggedIn: true,
                userAddress: "qu1abc",
            };
            const actual = authReducer(loggedInState, logout());
            // Logout reducer is empty, so state should remain unchanged
            expect(actual).toEqual(loggedInState);
        });
    });

    describe("complex state transitions", () => {
        it("should handle multiple actions in sequence", () => {
            let state = authReducer(initialState, logInSuccess(`${GLOBAL_OBJECT}1test`));
            state = authReducer(state, checkIfValidatorExist(true));
            state = authReducer(state, getValoperAddress("valoper1test"));
            state = authReducer(state, getWalletType("keplr"));

            expect(state.isLoggedIn).toBe(true);
            expect(state.userAddress).toBe(`${GLOBAL_OBJECT}1test`);
            expect(state.isValidated).toBe(true);
            expect(state.valoperAddress).toBe("valoper1test");
            expect(state.walletType).toBe("keplr");
        });
    });
});
