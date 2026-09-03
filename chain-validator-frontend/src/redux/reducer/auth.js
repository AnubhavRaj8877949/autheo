/*eslint-disable */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  isLoggedIn: false,
  isValidated: false,
  userAddress: "",
  isTx: false,
  valoperAddress: "",
  valoperAddressFromBlockChain: "",
  isValidatedInBlockchain: false,
  isEligibleForRewardProgram: false,
  totalValidators: "",
  userBalance: "",
  APY: "",
  apr: "",
  time: "",
  bondedBalance: {
    bondedAmount: "",
    unbondedAmount: "",
  },
  validatorCount: 0,
  userEvmAddress: "",
  walletType: "",
};

export const authSlice = createSlice({
  name: "drawer",
  initialState,
  reducers: {
    checkIfValidatorExist: (state, action) => {
      state.isValidated = action.payload;
    },
    checkIfValidatorExistInBlockchain: (state, action) => {
      state.isValidatedInBlockchain = action.payload;
    },
    logInSuccess: (state, action) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.userAddress = action.payload;
    },
    isTxOccur: (state, action) => {
      state.isTx = action.payload;
    },
    getValoperAddress: (state, action) => {
      state.valoperAddress = action.payload;
    },
    getValoperAddressFromBlockChain: (state, action) => {
      state.valoperAddressFromBlockChain = action.payload;
    },
    getBondedBalance: (state, action) => {
      state.bondedBalance = action.payload;
    },
    getTotalValidators: (state, action) => {
      state.totalValidators = action.payload;
    },
    getWalletBalance: (state, action) => {
      state.userBalance = action.payload;
    },
    getValidatorCount: (state, action) => {
      state.validatorCount = action.payload;
    },
    getEvmAddress: (state, action) => {
      state.userEvmAddress = action.payload;
    },
    getWalletType: (state, action) => {
      state.walletType = action.payload;
    },
    setIsEligibleForRewardProgram: (state, action) => {
      state.isEligibleForRewardProgram = action.payload;
    },
    logout: (state) => { },
    getApy: (state, action) => {
      state.APY = action.payload;
    },
    setApr: (state, action) => {
      state.apr = action.payload;
    },
  },
});

export const {
  logInSuccess,
  checkIfValidatorExist,
  checkIfValidatorExistInBlockchain,
  getBondedBalance,
  logout,
  isTxOccur,
  getWalletBalance,
  getValoperAddress,
  getValoperAddressFromBlockChain,
  getTotalValidators,
  getApy,
  setApr,
  getValidatorCount,
  getEvmAddress,
  getWalletType,
  setIsEligibleForRewardProgram
} = authSlice.actions;

export default authSlice.reducer;
