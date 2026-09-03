/*eslint-disable*/
import { Button } from "@mui/material";
import { CancelIconWrapper, DialogContent, StyledDialog } from "./styles";
import { ChainConfig, WALLET_TYPE } from "../../constants";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { showEVMAddress } from "../../services/showEVMAddress";
import {
  getValoperAddressFromBlockChain,
  getEvmAddress,
  getWalletType,
  logInSuccess,
  setIsEligibleForRewardProgram,
} from "../../redux/reducer/auth";
import Loader from "../Loader/Loader";
import { useGetNodeUrl } from "../../context/NodeUrl";
import { toast } from "../Common/Toast/Toast";
import CommonBtn from "../Common/CommonBtn/CommonBtn";
import { convertToValoperAddress } from "../../services/convertToValoperAddress";
import BackButton from "../BackButton/BackButton";
import { BackIcon } from "../../assets/Icons/SvgIcon.jsx";
import getLatestBlocks from "../../services/getLatestBlocks";
import getBlockFromChain from "../../services/apis/getLatestBlockFromChain";
import Keplr from "../../assets/Images/keplr.svg";
import cosmostation from "../../assets/Images/cosmostation.svg";
import CancelIcon from "../../assets/Icons/CancelIcon";
import { checkValidatorEligibility } from "../../internal/dry";

const LoginModal = ({ connectionOpen, connectionClose }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async (event, walletType) => {
    event.preventDefault();
    if (walletType === WALLET_TYPE.KEPLR) {
      if (!window.keplr) {
        toast.error("Install Keplr Wallet extension");
        return;
      }

      const chainId = ChainConfig?.chainId;

      try {
        await window.keplr.experimentalSuggestChain(ChainConfig);
        await window.keplr.enable(chainId);
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        if (!accounts.length) {
          toast.error("No accounts found in Keplr");
          return;
        }

        const evmAddress = showEVMAddress(accounts[0].address);
        const valoperAddress = convertToValoperAddress(
          accounts[0].address
        );

        let block = await getLatestBlocks(localStorage.getItem("node"));
        if (block?.result?.sync_info?.catching_up) {
          toast.error(
            `Either check your node connection or node is not synced.`,
          );
          return;
        }

        if (!block?.result?.sync_info?.catching_up) {
          const isEligible = await checkValidatorEligibility(valoperAddress);
          dispatch(setIsEligibleForRewardProgram(isEligible));
          dispatch(getEvmAddress(evmAddress));
          dispatch(getValoperAddressFromBlockChain(valoperAddress));
          dispatch(getWalletType(WALLET_TYPE.KEPLR));
          dispatch(logInSuccess(accounts[0].address));

          toast.success("Logged In Successfully");
        }
      } catch (error) {
        console.error("Keplr connection failed:", error);
        toast.error(
          error?.message
            ? `Failed to connect Keplr: ${error.message}`
            : "Failed to connect Keplr. Please try again."
        );
      }
    } else if (walletType === WALLET_TYPE.COSMOSTATION) {
      try {
        if (!window.cosmostation) {
          toast.error("Please install the Cosmostation extension!");
          return;
        }
        const chainId = ChainConfig?.chainId;
        await window?.cosmostation.providers.keplr.experimentalSuggestChain(
          ChainConfig,
        );
        const cosmoKeplr = window.cosmostation?.providers?.keplr;

        await window?.cosmostation?.providers?.keplr.enable(chainId);

        const signer = await cosmoKeplr.getOfflineSigner(chainId);

        const accounts = await signer.getAccounts();
        if (!accounts?.length) {
          toast.error("No accounts found in Keplr");
          return;
        }

        let block = await getLatestBlocks(localStorage.getItem("node"));
        let block1 = await getBlockFromChain();

        const latestBlockHeight = Number(block?.result?.block?.header?.height);
        const nodeBlockNumber = Number(block1?.data?.blocknumber);

        if (latestBlockHeight !== nodeBlockNumber) {
          toast.error(
            `Either check your node connection or node is not synced. Current syncing status: ${latestBlockHeight} out of ${nodeBlockNumber}`,
          );
          return;
        }

        if (latestBlockHeight == nodeBlockNumber) {
          const evmAddress = showEVMAddress(accounts[0].address);
          const valoperAddress = convertToValoperAddress(
            accounts[0].address
          );
          dispatch(getEvmAddress(evmAddress));
          dispatch(getValoperAddressFromBlockChain(valoperAddress));
          dispatch(getWalletType(WALLET_TYPE.COSMOSTATION));
          dispatch(logInSuccess(accounts[0].address));

          toast.success("Logged In Successfully");
        }

        if (accounts[0].address) {
          dispatch(getWalletType(WALLET_TYPE.COSMOSTATION));
          dispatch(getEvmAddress(evmAddress));

          dispatch(logInSuccess(accounts[0].address));
          return toast.success("Logged In Successfully");
        }
      } catch (err) {
        toast.error("Connection failed. Please try again.");
      }
    }
  };

  return (
    <>
      <StyledDialog
        className="connectionAttempt"
        open={connectionOpen}
        onClose={connectionClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogContent>
          <h3>Login with</h3>

          <div onClick={(event) => connectWallet(event, WALLET_TYPE.KEPLR)}
            style={{ cursor: "pointer" }}
            className="connectionAttempt_btn">
            <div className="connectionAttempt_btn_inner">
              <img src={Keplr} alt="" />
              <button >
                Keplr Connect
              </button>
            </div>

            {/* <div className="connectionAttempt_btn_inner">
              <img src={cosmostation} alt="logo" />

              <button onClick={(event) => connectWallet(event, WALLET_TYPE.COSMOSTATION)}>
                Cosmostation Wallet
              </button>
            </div> */}
          </div>
        </DialogContent>
      </StyledDialog>
      {isLoading && <Loader />}
    </>
  );
};

export default LoginModal;
