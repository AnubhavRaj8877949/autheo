import React, { useEffect, useState, useCallback } from "react";
import logo from "../../assets/Images/logo.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, IconButton } from "@mui/material";
import CopyIcon from "../../assets/Icons/CopyIcon";
import "./Header.css";
import { getWalletBalance, isTxOccur, logout } from "../../redux/reducer/auth";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useGetNodeUrl } from "../../context/NodeUrl";
import { getUserBalance } from "../../services/getUserBalance";
import {
  CURRENCY,
  MAINNET_EXPLORER_URL,
  splitAddress,
  TESTNET_EXPLORER_URL,
} from "../../constants";
import { toast } from "../Common/Toast/Toast";
import { ChainConfig, ROUTE_PATHS, NETWORK_TYPE } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import SunIcon from "../../assets/Icons/SunIcon";
import MoonIcon from "../../assets/Icons/MoonIcon";
import {
  AvatarIcon,
  ChevronDownIcon,
  LogoutIcon,
  ManageAccIcon,
  WalletIcon,
} from "../../assets/Icons/SvgIcon";
import { Tooltip } from "antd";

function HeaderItems({ onNavigate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setNodeUrl, setIsNodeAdded } = useGetNodeUrl();
  const { userAddress, isTx, userBalance, isLoggedIn, userEvmAddress, isEligibleForRewardProgram } =
    useSelector((state) => state.auth);
  const { isDarkTheme, toggleTheme } = useTheme();
  const [networkAnchorEl, setNetworkAnchorEl] = useState(null);
  const handleNetworkClick = (event) => {
    setNetworkAnchorEl(event.currentTarget);
  };

  const handleNetworkClose = () => {
    setNetworkAnchorEl(null);
  };

  const handleWalletClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleWalletClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = () => {
    handleWalletClose();
    handleNetworkClose();
    if (typeof onNavigate === "function") onNavigate();
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const fetchBalance = useCallback(async () => {
    try {
      let response = await getUserBalance(userAddress);
      dispatch(getWalletBalance(response));
    } catch (err) {
      return err;
    }
  }, [userAddress, dispatch]);

  useEffect(() => {
    if (userAddress?.length > 0 || isTx) {
      setTimeout(() => {
        fetchBalance();
        dispatch(isTxOccur(false));
      }, 1500);
    }
  }, [userAddress, isTx, fetchBalance, dispatch]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Do you want to logout?",
      padding: "40px",
      background: "var(--theme-swal-bg)",
      color: "var(--theme-text-primary)",
      showCancelButton: true,
      confirmButtonColor: "unset",
      cancelButtonColor: "unset",
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        sessionStorage.clear();
        setIsNodeAdded(false);
        setNodeUrl("");
        navigate(ROUTE_PATHS.LOGIN);
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      handleWalletClose();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const copiedAddress = (data) => {
    navigator.clipboard.writeText(data);
    toast.success("Copied");
  };

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", async () => {
      const chainId = ChainConfig.chainId;
      if (window.keplr) {
        try {
          const offlineSigner = window.keplr.getOfflineSigner(chainId);
          const accounts = await offlineSigner.getAccounts();
          if (accounts[0].address) {
            dispatch(logout());
            sessionStorage.clear();
            setIsNodeAdded(false);
            setNodeUrl("");
            navigate(ROUTE_PATHS.LOGIN);
          }
        } catch (error) {
          //console.error("Error fetching new account:", error);
        }
      }
    });
  }, [dispatch, navigate, setIsNodeAdded, setNodeUrl]);

  const isMainnetAvailable = Boolean(MAINNET_EXPLORER_URL);
  const isTestnetAvailable = Boolean(TESTNET_EXPLORER_URL) || (!isMainnetAvailable && !Boolean(TESTNET_EXPLORER_URL));
  const selectedNetwork = isMainnetAvailable ? NETWORK_TYPE.MAINNET : NETWORK_TYPE.TESTNET;

  return (
    <>
      <div className="headerWrapper">
        <div className="header">
          <div className="headerLeft">
            <img src={logo} alt="logo" className="logo" />
            <div className="headerLinks">
              <ul className="">
                <li className="li">
                  {isLoggedIn && (
                    <Link
                      to="/dashboard"
                      onClick={handleNavigate}
                      className={`link ${pathname === "/dashboard" ? "active" : ""
                        }`}
                    >
                      Dashboard
                    </Link>
                  )}

                  {!isLoggedIn && (
                    <Link
                      to="/login"
                      onClick={handleNavigate}
                      className={`link ${pathname === "/login" ? "active" : ""
                        }`}
                    >
                      Login
                    </Link>
                  )}
                  <Link
                    to="/validators"
                    onClick={handleNavigate}
                    className={`link ${pathname === "/validators" ? "active" : ""
                      }`}
                  >
                    Validators
                  </Link>

                  {isLoggedIn && isEligibleForRewardProgram && <Link
                    to="/genesis-reward-program"
                    onClick={handleNavigate}
                    className={`link ${pathname === "/genesis-reward-program" ? "active" : ""
                      }`}
                  >
                    Genesis Reward Program
                  </Link>}
                  {/* isLoggedIn && (
                    <Link
                      to="/account"
                      className={`link ${
                        pathname === "/account" ? "active" : ""
                      }`}
                    >
                      Manage Account
                    </Link>
                  ) */}
                </li>
              </ul>
            </div>
          </div>
          <div className="headerRight">

            <div className="network-selector">
              <button
                className="network-selector-btn"
                onClick={handleNetworkClick}
              >
                <span className={`network-name ${selectedNetwork}`}>
                  {selectedNetwork === NETWORK_TYPE.TESTNET ? "Testnet" : "Mainnet"}
                </span>
                <div
                  className={`network-selector-btn__chevron ${Boolean(networkAnchorEl) ? "open" : ""
                    }`}
                >
                  <ChevronDownIcon />
                </div>
              </button>

              <Menu
                anchorEl={networkAnchorEl}
                open={Boolean(networkAnchorEl)}
                onClose={handleNetworkClose}
                className="network-menu-popover"
                sx={{
                  "& .MuiPaper-root": {
                    mt: "6px",
                  },
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    style: {
                      width: networkAnchorEl
                        ? networkAnchorEl.clientWidth
                        : undefined,
                    },
                  },
                }}
              >
                <div className="network-popover-content">
                  <Tooltip
                    title={!isTestnetAvailable ? "Coming Soon" : ""}
                    placement="left"
                    arrow
                  >
                    <span
                      className={!isTestnetAvailable ? "disabled" : ""}
                      style={{
                        cursor: !isTestnetAvailable ? "not-allowed" : "pointer",
                      }}
                    >
                      <MenuItem
                        className={`network-popover-menu-item ${selectedNetwork === NETWORK_TYPE.TESTNET ? "active" : ""
                          }`}
                        onClick={() => {
                          handleNetworkClose();
                          handleNavigate();
                          if (TESTNET_EXPLORER_URL)
                            window.open(TESTNET_EXPLORER_URL, "_blank");
                        }}
                        disabled={!isTestnetAvailable}
                      >
                        <span className="network-popover-menu-item__label">
                          Testnet
                        </span>
                      </MenuItem>
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={!isMainnetAvailable ? "Coming Soon" : ""}
                    placement="left"
                    arrow
                  >
                    <span
                      className={!isMainnetAvailable ? "disabled" : ""}
                      style={{
                        cursor: !isMainnetAvailable ? "not-allowed" : "pointer",
                      }}
                    >
                      <MenuItem
                        className={`network-popover-menu-item ${selectedNetwork === NETWORK_TYPE.MAINNET ? "active" : ""
                          } ${!isMainnetAvailable ? "disabled" : ""}`}
                        onClick={() => {
                          if (isMainnetAvailable) {
                            handleNetworkClose();
                            handleNavigate();
                            if (MAINNET_EXPLORER_URL)
                              window.open(MAINNET_EXPLORER_URL, "_blank");
                          }
                        }}
                        disabled={!isMainnetAvailable}
                        sx={{ width: "100%" }}
                      >
                        {/* {!isMainnetAvailable && (
                          <StopOutlined
                            style={{ marginRight: 8, fontSize: "14px" }}
                          />
                        )} */}
                        <span className="network-popover-menu-item__label">
                          Mainnet
                        </span>
                      </MenuItem>
                    </span>
                  </Tooltip>
                </div>
              </Menu>
            </div>

            {isLoggedIn && (
              <div className="headerButtons">
                <button
                  className="wallet-header-btn"
                  onClick={handleWalletClick}
                >
                  <div className="wallet-header-btn__avatar">
                    <AvatarIcon />
                  </div>
                  <span className="wallet-header-btn__address">
                    {splitAddress(userEvmAddress, 6, 4)}
                  </span>
                  <div
                    className={`wallet-header-btn__chevron ${Boolean(anchorEl) ? "open" : ""
                      }`}
                  >
                    <ChevronDownIcon />
                  </div>
                </button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleWalletClose}
                  className="wallet-menu-popover"
                  sx={{
                    "& .MuiPaper-root": {
                      mt: "6px",
                    },
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  slotProps={{
                    paper: {
                      elevation: 0,
                    },
                  }}
                >
                  <div className="wallet-popover-content">
                    <div className="wallet-popover-item">
                      <span className="wallet-popover-label">
                        ACTIVE WALLET
                      </span>
                      <div className="wallet-popover-address-wrap">
                        <span className="wallet-popover-address">
                          {splitAddress(userEvmAddress, 8, 8)}
                        </span>
                        <IconButton
                          size="small"
                          onClick={() => copiedAddress(userEvmAddress)}
                          sx={{
                            color: "#99a1af",
                            "&:hover": { color: "var(--brand-primary)" },
                          }}
                        >
                          <CopyIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </div>
                    </div>

                    <div className="wallet-balance-card">
                      <div className="wallet-balance-card__bg-icon">
                        <WalletIcon />
                      </div>
                      <span className="wallet-balance-label">
                        TOTAL BALANCE
                      </span>
                      <div
                        className="wallet-balance-amount"
                        data-testid="balance-amount"
                        onClick={() => copiedAddress(userBalance)}
                        style={{ cursor: "pointer" }}
                      >
                        {userBalance
                          ? Number(userBalance).toLocaleString()
                          : 0.0}{" "}
                        {CURRENCY}
                      </div>
                      {/* TODO: Need to set the default price in env */}
                      {/* <div className="wallet-balance-usd">
                        ≈ ${userBalance ? (Number(userBalance) * 0.1578).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} USD
                      </div> */}
                    </div>

                    <div className="wallet-popover-menu">
                      <MenuItem
                        className="wallet-popover-menu-item"
                        onClick={() => {
                          handleWalletClose();
                          navigate(ROUTE_PATHS.ACCOUNT);
                        }}
                      >
                        <div className="wallet-popover-menu-item__icon">
                          <ManageAccIcon />
                        </div>
                        <span className="wallet-popover-menu-item__label">
                          Manage Account
                        </span>
                      </MenuItem>

                      <MenuItem
                        className="wallet-popover-menu-item logout"
                        onClick={() => {
                          handleWalletClose();
                          handleLogout();
                          handleNavigate();
                        }}
                      >
                        <div className="wallet-popover-menu-item__icon">
                          <LogoutIcon />
                        </div>
                        <span className="wallet-popover-menu-item__label">
                          Logout
                        </span>
                      </MenuItem>
                    </div>
                  </div>
                </Menu>
              </div>
            )}
            <button
              className="theme-toggle-btn"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={toggleTheme}
              aria-label={
                isDarkTheme ? "Switch to light mode" : "Switch to dark mode"
              }
              title={
                isDarkTheme ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkTheme ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderItems;
