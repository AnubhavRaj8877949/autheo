import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import LinkDropdown from "./AccountDropdown";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import theme from "../../theme";
import { notLoggedInRoutes, loggedInRoutes } from "../../utils/navItems";

import { Wrapper, WalletDetails, NavItem, NodeBox } from "./styles";
import Address from "../Common/Address";
import CancelIcon from "../../assets/Icons/CancelIcon";
import DropdownIcon from "../../assets/Icons/DropdownIcon";
import { useStyles } from "../../services/refresh";
import RefreshIcon from "../../assets/Icons/RefreshIcon";
import { useNavigate } from "react-router-dom";
import { getWalletBalance, isTxOccur, logout } from "../../redux/reducer/auth";
import Swal from "sweetalert2";
import LoginIcon from "../../assets/Icons/LoginIcon";
import clsx from "clsx";
import InfoIcon from "../../assets/Icons/InfoIcon";
import { CURRENCY, ROUTE_PATHS } from "../../constants";
import { useGetNodeUrl } from "../../context/NodeUrl";
import { getUserBalance } from "../../services/getUserBalance";
import { toFixed } from "../../utils/toFixed";

const Sidebar = ({ isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
  const classes = useStyles();
  const ref = useRef();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isLoggedIn, userAddress, isTx } = useSelector((state) => state.auth);
  const [spin, setSpin] = useState(false);
  const { userBalance } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useOnClickOutside(ref, () => setIsMobileSidebarOpen(false));
  const { pathname } = location;
  const routes = isLoggedIn ? loggedInRoutes : notLoggedInRoutes;
  const { nodeUrl, setNodeUrl, isNodeAdded, setIsNodeAdded } = useGetNodeUrl();

  const closeSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, [setIsMobileSidebarOpen]);

  const handleLogout = () => {
    Swal.fire({
      title: "LOGOUT",
      text: "Are you sure?",
      padding: "20px 30px",
      background: "var(--theme-swal-bg)",
      color: "var(--theme-text-primary)",
      showCancelButton: true,
      confirmButtonColor: "unset",
      cancelButtonColor: "unset",
      confirmButtonText: "YES",
      borderRadius: "14px",
      cancelButtonText: "NO",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        setIsNodeAdded(false);
        setNodeUrl("");
        navigate(ROUTE_PATHS.LOGIN);
      }
    });
  };

  const buttonMove = async () => {
    setSpin(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    setSpin(false);
  };

  const balanceRefresh = () => {
    fetchBalance();
    buttonMove();
  };

  const handleNode = () => {
    if (
      nodeUrl.includes("ws://") ||
      nodeUrl.includes("https://") ||
      nodeUrl.includes("http://") ||
      nodeUrl.includes("wss://")
    ) {
      localStorage.setItem("node", nodeUrl);
      setIsNodeAdded(true);
    }
  };

  const handleNodeChange = (e) => {
    setNodeUrl(e.target.value);
    setIsNodeAdded(false);
  };

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

  return (
    <Wrapper isopen={`${isMobileSidebarOpen}`} ref={ref}>
      <>
        {isMobile && (
          <Box className="close-btn">
            <IconButton onClick={closeSidebar}>
              <CancelIcon
                sx={{
                  color: (theme) => theme.palette.text.primary,
                }}
              />
            </IconButton>
          </Box>
        )}

        {isLoggedIn && (
          <WalletDetails style={{ background: "#37373c" }}>
            <Box display="flex" alignItems="center">
              <Typography className="wallet-name">
                {userAddress?.name ? userAddress?.name : " "}
              </Typography>
            </Box>
            <Address
              style={{ background: "#252527" }}
              address={userAddress ? userAddress : "-"}
              minmize={true}
            />
            <Typography className="wallet-balance">
              Available Balance:{" "}
              <RefreshIcon
                sx={{
                  fontSize: "16px",
                  marginLeft: "11px",
                  marginTop: "5px",
                }}
                className={clsx({
                  [classes.refresh]: true,
                  spin: spin,
                })}
                onClick={balanceRefresh}
                spin={360}
              />
            </Typography>
            <Typography
              fontWeight="500"
              className="wallet-balance__amount"
              title={userBalance ? Number(userBalance)?.noExponents() : "0"}
            >
              {userBalance
                ? toFixed(Number(userBalance)?.noExponents(), 2)
                : "0"}{" "}
              {CURRENCY}
            </Typography>
          </WalletDetails>
        )}
        <Box component="nav" mt={isLoggedIn ? "20px" : "40px"}>
          {routes.map((item) => (
            <React.Fragment key={item.label}>
              {item.hasSubLinks ? (
                <LinkDropdown
                  trigger={
                    <NavItem
                      to="/"
                      key={item.label}
                      active={`${pathname.includes(item.path)}`}
                    >
                      <item.Icon />
                      <Typography ml="20px" fontWeight="600">
                        {item.label}
                      </Typography>
                      <DropdownIcon
                        sx={{
                          flexShrink: 0,
                        }}
                      />
                    </NavItem>
                  }
                ></LinkDropdown>
              ) : (
                <NavItem
                  to={item.path}
                  active={`${pathname.includes(item.path)}`}
                >
                  <item.Icon />
                  <Typography ml="20px" fontWeight="600">
                    {item.label}
                  </Typography>
                </NavItem>
              )}
            </React.Fragment>
          ))}
          {isLoggedIn ? (
            <NavItem to={`${pathname}`} onClick={handleLogout}>
              <LoginIcon />
              <Typography ml="20px" fontWeight="600">
                Logout
              </Typography>
            </NavItem>
          ) : (
            ""
          )}
        </Box>
      </>

      <NodeBox>
        <Box>


          <div className="refresh-wrap">
            <Typography
              className="node-text"
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              Node Information
              <Tooltip
                className="vaildator-card__tooltip"
                placement="top"
                arrow
                title={
                  <Typography variant="h6" padding={1}>
                    Enter Your Validator Node IP <br />
                  </Typography>
                }
              >
                <span
                  className="tooltipStyleInfo infoIcon"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <InfoIcon />
                </span>
              </Tooltip>
            </Typography>
          </div>

          {!isLoggedIn ? (
            <>
              <input
                value={nodeUrl}
                onChange={(e) => handleNodeChange(e)}
                disabled={isLoggedIn}
              />
              <Button variant="contained" onClick={handleNode}>
                Submit
              </Button>
            </>
          ) : (
            ""
          )}
          <Typography className="ver-text" color={theme.palette.gray.main}>
            {isNodeAdded === true ? nodeUrl : "Enter Valid Node Url"}
          </Typography>
        </Box>
      </NodeBox>
    </Wrapper>
  );
};

export default Sidebar;
