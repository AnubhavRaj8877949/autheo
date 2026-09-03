/* eslint-disable */

import { Box, Typography, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getValoperAddressFromBlockChain,
  logInSuccess,
  getEvmAddress,
  getWalletType,
} from "../../redux/reducer/auth";
import { useGetNodeUrl } from "../../context/NodeUrl";
import { toast } from "../../components/Common/Toast/Toast";
import { NodeBox } from "./styles";
import getLatestBlocks from "../../services/getLatestBlocks";
import getBlockFromChain from "../../services/apis/getLatestBlockFromChain";
import { checkNodeStatus } from "../../services/checkValidUrl.js";
import Loader from "../../components/Loader/Loader";
import { showEVMAddress } from "../../services/showEVMAddress";
import { ChainConfig, USER_GUIDE_URL, WALLET_TYPE } from "../../constants";
import BackButton from "../../components/BackButton/BackButton";
import BackIcon from "../../assets/Icons/BackIcon";
import { convertToValoperAddress } from "../../services/convertToValoperAddress";
import { getAddress } from "../../services/getAddress";
import { userEvmAddress } from "../../services/userEvmAddress";
import fetchValoperAddress from "../../services/fetchValoperAddress";
import LoginModal from "../../components/LoginWalletModal/LoginModal";
import LoginIcon from "../../assets/Icons/LoginIcon";
import { RightArrowIcon, UserDocsIcon, WalletIcon } from "../../assets/Icons/UserDocs";
import { Link } from "react-router-dom";

import LeftSection from "./LeftSection";
import ValidatorJourney from "./ValidatorJourney";
import { ExternalLink } from "../../assets/Icons/SvgIcon";
import ConnectWalletIcon from "../../assets/Icons/ConnectWalletIcon";

const Login = () => {
  const dispatch = useDispatch();
  // const { isLoggedIn } = useSelector((state) => state.auth);
  const { nodeUrl, setNodeUrl, isNodeAdded, setIsNodeAdded } = useGetNodeUrl();
  const [mnemonics, setMnemonics] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [walletType, setWalletType] = useState(""); // Added walletType state
  const [nodeUrlValidErr, setNodeUrlValidErr] = useState("");

  const changeHandler = (e) => setMnemonics(e.target.value?.trim());

  const handleNode = async () => {
    const allowInsecure = "true";
    const trimmedNodeUrl = nodeUrl?.trim();

    const isValidUrl = trimmedNodeUrl
      ? allowInsecure
        ? /^(https?|wss?):\/\//.test(trimmedNodeUrl)
        : /^(https|wss):\/\//.test(trimmedNodeUrl)
      : false;

    // if (!trimmedNodeUrl) {
    //   setNodeUrlValidErr(
    //     allowInsecure
    //       ? "Please enter a valid node URL starting with https://, http://, wss://, or ws://."
    //       : "Only secure node URLs are allowed. Please use HTTPS or WSS."
    //   );
    //   return;
    // }

    // if (!isValidUrl) {
    //   setNodeUrlValidErr(
    //     allowInsecure
    //       ? "Please enter a valid node URL starting with https://, http://, wss://, or ws://."
    //       : "Only secure node URLs are allowed. Please use HTTPS or WSS."
    //   );
    //   return;
    // }

    setNodeUrlValidErr("");

    try {
      const checkNodeUrl = await checkNodeStatus(trimmedNodeUrl);
      if (checkNodeUrl) {
        localStorage.setItem("node", trimmedNodeUrl);
        setIsNodeAdded(true);
        return;
      }

      setNodeUrlValidErr("Unable to connect to this node. Please verify the URL and try again.");
    } catch (error) {
      setNodeUrlValidErr("Unable to connect to this node. Please verify the URL and try again.");
    }
  };

  const handleNodeChange = (e) => {
    setNodeUrlValidErr("")
    setNodeUrl(e.target.value ? e.target.value.trim() : "");
    setIsNodeAdded(false);
  };

  const handleClearNode = () => {
    setNodeUrl("");
    setIsNodeAdded(false);
    localStorage.removeItem("node");
  };

  // const submitMnemonicsHandler = async (event) => {
  //   event.preventDefault();
  //   if (!mnemonics) {
  //     toast.error("Mnemonics is required!");
  //     return;
  //   }

  //   try {
  //     dispatch(getWalletType(WALLET_TYPE.NO_WALLET));
  //     setIsLoading(true);

  //     const [res, evmAddress] = await Promise.all([
  //       getAddress(mnemonics),
  //       userEvmAddress(mnemonics),
  //     ]);

  //     if (res?.message) {
  //       toast.error(`Invalid node, ${res.message}`);
  //       setIsLoading(false);
  //       return;
  //     }

  //     const [block, block1] = await Promise.all([
  //       getLatestBlocks(localStorage.getItem("node")),
  //       getLatestBlocks(ChainConfig.rpc),
  //     ]);

  //     const currentHeight = Number(block?.result?.block?.header?.height);
  //     const syncedHeight = Number(block1?.result?.block?.header?.height);

  //     if (currentHeight !== syncedHeight) {
  //       toast.error(
  //         `Either check your node connection or node is not synced, current syncing status: ${currentHeight} out of ${syncedHeight}`
  //       );
  //       setIsLoading(false);
  //       return;
  //     }

  //     const valoperResponse = await fetchValoperAddress(mnemonics);

  //     dispatch(getValoperAddressFromBlockChain(valoperResponse));
  //     dispatch(getEvmAddress(evmAddress));
  //     dispatch(logInSuccess(res));

  //     toast.success("Logged In Successfully");
  //   } catch (err) {
  //     toast.error(
  //       err?.message || "Something went wrong. Please check your node."
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleWalletModal = () => {
    setConnectionOpen(!connectionOpen);
  };

  // const connectionClose = () => {
  //   setConnectionOpen(false);
  // };

  // const connectKeplr = async () => {
  //   if (!window.keplr) {
  //     toast.error("Install Keplr Wallet extension");
  //     return;
  //   }
  //   setIsLoading(true);

  //   const chainId = ChainConfig?.chainId;

  //   try {
  //     await window.keplr.disable(chainId);
  //     await window.keplr.enable(chainId);

  //     const offlineSigner = window.keplr.getOfflineSigner(chainId);
  //     const accounts = await offlineSigner.getAccounts();

  //     if (!accounts.length) {
  //       toast.error("No accounts found in Keplr");
  //       return;
  //     }

  //     const evmAddress = showEVMAddress(accounts[0].address);
  //     const valoperAddress = await convertToValoperAddress(accounts[0].address);

  //     let block = await getLatestBlocks();
  //     let block1 = await getBlockFromChain();

  //     const latestBlockHeight = Number(block?.result?.block?.header?.height);
  //     const nodeBlockNumber = Number(block1?.data?.blocknumber);

  //     if (latestBlockHeight !== nodeBlockNumber) {
  //       toast.error(
  //         `Either check your node connection or node is not synced. Current syncing status: ${latestBlockHeight} out of ${nodeBlockNumber}`
  //       );
  //       return;
  //     }

  //     if (latestBlockHeight == nodeBlockNumber) {
  //       dispatch(getEvmAddress(evmAddress));
  //       dispatch(getValoperAddressFromBlockChain(valoperAddress));
  //       dispatch(getWalletType(WALLET_TYPE.KEPLR)); // Replaced "keplr" with WALLET_TYPE.KEPLR
  //       dispatch(logInSuccess(accounts[0].address));

  //       toast.success("Logged In Successfully");
  //     }
  //     setIsLoading(false);
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.error("Error connecting Keplr:", error);
  //     toast.error("Failed to connect Keplr. Please try again.");
  //   }
  // };

  return (
    <>
      <div className="bg-glow" />
      <div>
        <div className="auth-wrapper">
          <LeftSection />
          <NodeBox className="MuiBox-login" style={{ margin: 0, flexShrink: 0 }}>
            <Box className="box-login">
              <div className="highlight" />
              <div className="refresh-wrap">
                <Typography className={`node-text ${isNodeAdded ? "validator-active" : ""}`}>
                  {isNodeAdded ? (
                    <>
                      <BackButton
                        onClick={handleClearNode}
                        title={<BackIcon />}
                      />
                      {"Validator Application"}
                    </>
                  ) : (
                    "Node Information"
                  )}
                </Typography>
                <p>Step 1 of 2</p>
              </div>


              <>

                {!isNodeAdded && (
                  <>
                    <label>Node Information.</label>
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        value={nodeUrl}
                        onChange={(e) => handleNodeChange(e)}
                        disabled={isNodeAdded}
                        placeholder="Enter Node URL"

                      />
                      <span className="errorMsg errorMsg-login">{nodeUrlValidErr}</span>
                    </div>

                    <div style={{ marginTop: "50px" }}>
                      <Button
                        style={{ margin: "auto" }}
                        className="submit-btn"
                        variant="contained"
                        type="submit"
                        onClick={handleNode}
                        disabled={!nodeUrl}
                      >
                        Submit
                      </Button>

                    </div>
                  </>
                )}

                {/* {isNodeAdded && (
                <form onSubmit={submitMnemonicsHandler}>
                  <input
                    label="Mnemonics"
                    value={mnemonics}
                    placeholder="Paste or enter your mnemonics"
                    onChange={changeHandler}
                    autoComplete="off"
                    Connect
                    Wallet
                    disabled={!isNodeAdded || isLoading}
                    type="password"
                    className="input-style"
                  />

                  <div className="auth-wrapper__btns">
                    <Button
                      style={{ width: "100%", marginBottom: "10px" }}
                      className=""
                      variant="contained"
                      type="submit"
                      disabled={!isNodeAdded}
                    >
                      <span className="btn-icon">
                        <LoginIcon />
                      </span>
                      Log In
                    </Button>
                  </div>
                </form>
              )}
              {isNodeAdded && <h3 style={{ marginLeft: "48%" }}>OR</h3>} */}
                {isNodeAdded && (
                  // <div
                  //   className="auth-wrapper__btns"
                  //   style={{ padding: "30px 0px" }}
                  // >
                  //   <Button
                  //     style={{ width: "100%" }}
                  //     variant="contained"
                  //     type="submit"
                  //     disabled={!isNodeAdded}
                  //     // onClick={connectKeplr}
                  //     onClick={handleWalletModal}
                  //   >
                  //     <span className="btn-icon">
                  //       <ConnectWalletIcon />
                  //     </span>
                  //     Connect Wallet
                  //   </Button>
                  // </div>

                  <div className="wallets-list">
                    {/* <button type="submit" disabled={!isNodeAdded} onClick={handleWalletModal}>
                      <div className="wallet-info">
                        <div className="wallet-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="12" fill="#00C3F8" />
                            <path d="M9 7V17M9 12L15 7M9 12L15 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="wallet-details">
                          <div className="wallet-name">Keplr</div>
                          <div className="wallet-network">Cosmos Network</div>
                        </div>
                      </div>
                      <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button> */}

                    <button type="submit" disabled={!isNodeAdded} onClick={handleWalletModal}>
                      <div className="wallet-info">
                        <div className="wallet-icon">
                          <WalletIcon size={24} color="#00C3F8" />
                        </div>
                        <div className="wallet-details">
                          <div className="wallet-name">Connect Wallet</div>
                          <div className="wallet-network">Secure & Fast</div>
                        </div>
                      </div>
                      <RightArrowIcon className="chevron-icon" />
                    </button>
                  </div>


                )}

                {connectionOpen && (
                  <LoginModal
                    connectionOpen={true}
                    connectionClose={handleWalletModal}
                  />
                )}
              </>
            </Box>
            <div className="user-guide-link">
              <UserDocsIcon />   <a href={USER_GUIDE_URL} rel="noopener noreferrer" target="_blank" style={{ textDecoration: "none" }}>
                Read the Node Setup Guide
              </a>
              <ExternalLink />
            </div>

          </NodeBox>

        </div>
        <ValidatorJourney />
        {isLoading && <Loader />}
      </div>
    </>
  );
};

export default Login;
