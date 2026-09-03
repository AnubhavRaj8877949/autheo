/*eslint-disable */
import {
  TableContainer,
  TableCell,
  TableBody,
  Table,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import theme from "../../../theme";
import getValidatorCommission from "../../../services/apis/getValidatorCommission";
import getDelegatorRewards from "../../../services/apis/getDelegatorRewards";
import {
  ChainConfig,
  CURRENCY,
  DENOM,
  bondedTableHeader,
  stopMenuOptions,
  WALLET_TYPE,
  VALIDATOR_STATUS,
  ROUTE_PATHS,
} from "../../../constants";
import { useGenesisLock } from "../../../hooks/useGenesisLock";
import { isTxOccur } from "../../../redux/reducer/auth";
import InfoIcon from "../../../assets/Icons/InfoIcon";
import { noExponential } from "../../../utils/commonFunctions";
import "./style.css";
import { toFixed } from "../../../utils/toFixed";
import CountdownTimer from "./CountDownTimer";
import { keplrClaimRewards } from "../../../keplrEvents/keplrClaimRewards";
import Loader from "../../../components/Loader/Loader";

const BondTable = ({ bondedData, fetchData }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [delegatorReward, setDelegatorReward] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userAddress, walletType, isTx } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { isGenesis, lockActive, daysRemaining, lockDays } = useGenesisLock({
    walletAddress: userAddress,
    createdAt: bondedData?.createdAt,
    selfStake: bondedData?.selfStake,
  });

  useEffect(() => {
    const fetchCommission = async () => {
      if (bondedData?.operatorAddress) {
        const response = await getValidatorCommission(bondedData.operatorAddress);
        if (!response?.error) {
          const nativeCommission = response?.data?.commission?.commission?.find(
            (c) => c.denom === (DENOM || ChainConfig.currencies[0].coinMinimalDenom)
          );
          if (nativeCommission) {
            setCommissionAmount(Number(nativeCommission.amount) / 10 ** 18);
          }
        }
      }
    };
    fetchCommission();
  }, [bondedData?.operatorAddress]);

  useEffect(() => {
    const fetchDelegatorReward = async () => {
      if (userAddress) {
        const response = await getDelegatorRewards(userAddress);
        if (!response?.error) {
          setDelegatorReward(response?.amount || 0);
        }
      }
    };
    fetchDelegatorReward();
  }, [userAddress, isTx]);


  const totalReward = Number(delegatorReward) + Number(commissionAmount);

  const shouldShow =
    !!bondedData?.unbondingTime && Number(bondedData?.selfStake) / 10 ** 18 < 100;
  let message =
    shouldShow && `Minimum required balance is 100 ${CURRENCY}`;

  const handleClaimRewards = () => {
    const totalFormatted = totalReward ? noExponential(totalReward) : "0";

    if (totalReward < 1) {
      Swal.fire({
        title: "No Rewards",
        text: "You don't have any rewards to claim.",
        icon: "info",
        confirmButtonColor: "#1677ff",
        background: "var(--theme-swal-bg)",
        color: "var(--theme-text-primary)",
      });
      return;
    }

    Swal.fire({
      title: "Claim Rewards",
      html: `Do you want to claim <b>${totalFormatted} ${CURRENCY}</b>?<br/><br/>
        <span style="font-size:13px;opacity:0.8;">
          Staking Rewards: ${noExponential(delegatorReward)} ${CURRENCY}<br/>
          Validator Commission: ${noExponential(commissionAmount)} ${CURRENCY}
        </span>`,
      showCancelButton: true,
      confirmButtonColor: "unset",
      cancelButtonColor: "unset",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      background: "var(--theme-swal-bg)",
      color: "var(--theme-text-primary)",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (walletType === WALLET_TYPE.KEPLR) {
          keplrClaimRewards(
            userAddress,
            bondedData?.operatorAddress,
            setIsLoading,
            () => {
              dispatch(isTxOccur(!isTx));
              if (fetchData) fetchData();
            }
          );
        }
       
      }
    });
  };

  return (
    <>
      <div className="common-table Bondtable bnd_timer">
        <div className="title_bnd">
          <Typography
            className="account-card__title title"
            style={{ paddingTop: "30px" }}
          >
            Bond Details
          </Typography>
          <CountdownTimer unbondingTime={bondedData?.unbondingTime} />
        </div>

        <TableContainer
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          <Table aria-label="simple table" className="bondTable">
            <TableHead>
              <TableRow>
                {bondedTableHeader?.map((item, index) => (
                  <TableCell key={index}>
                    <Typography
                      color="text.secondary"
                      fontSize="14px"
                      lineHeight="24px"
                    >
                      {item?.heading}
                      {item?.content && (
                        <Tooltip
                          className="tooltip-common"
                          placement="top"
                          arrow
                          title={
                            <Typography variant="h6" padding={1}>
                              {item?.content}
                            </Typography>
                          }
                        >
                          <IconButton className="infoIcon">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    paddingLeft: isMobile ? "40px" : "80px",
                  }}
                >
                  <Typography variant="body2">
                    {bondedData?.selfStake
                      ? noExponential(
                        toFixed(Number(bondedData?.selfStake) / 10 ** 18, 4)
                      )
                      : "0"}{" "}
                    {CURRENCY}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {bondedData?.unbondingAmount
                      ? noExponential(toFixed(bondedData?.unbondingAmount, 4))
                      : "0"}{" "}
                    {CURRENCY}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={
                      <Typography variant="h6" padding={1}>
                        Staking Rewards: {noExponential(delegatorReward)}{" "}
                        {CURRENCY}
                        <br />
                        Validator Commission: {noExponential(commissionAmount)}{" "}
                        {CURRENCY}
                      </Typography>
                    }
                    placement="top"
                    style={{ cursor: "pointer" }}
                    arrow
                  >
                    <Typography variant="body2">
                      {`${toFixed(totalReward, 2)} `} {CURRENCY}
                    </Typography>
                  </Tooltip>
                </TableCell>

                {bondedData?.status == VALIDATOR_STATUS.ACTIVE ||
                  bondedData?.status == VALIDATOR_STATUS.DEACTIVATING ? (
                  <TableCell>
                    <div className="bond-actions">
                      {stopMenuOptions?.map((option) => {
                        const isStopOption =
                          option?.path === ROUTE_PATHS.ACCOUNT_FUNDS_STOP_VALIDATOR;
                        const stopLocked = isStopOption && isGenesis && lockActive;
                        const disabled =
                          bondedData?.status === VALIDATOR_STATUS.DEACTIVATING ||
                          stopLocked;
                        return (
                          <Tooltip
                            key={option?.path}
                            title={
                              stopLocked
                                ? `Genesis validators cannot stop validating before ${lockDays} days from activation. ${daysRemaining} day(s) remaining.`
                                : ""
                            }
                            placement="top"
                            arrow
                          >
                            <div className={disabled ? "disabledlinks" : "notDiabled"}>
                              <Link
                                to={disabled ? "#" : option.path}
                                onClick={
                                  disabled ? (e) => e.preventDefault() : undefined
                                }
                                className={`bonds-btns ${option.style}`}
                                aria-disabled={disabled}
                                tabIndex={disabled ? -1 : 0}
                              >
                                <Typography variant="body3">
                                  {option?.label}
                                </Typography>
                              </Link>
                            </div>
                          </Tooltip>
                        );
                      })}
                      <Tooltip
                        title={
                          totalReward < 1
                            ? `No claimable amount available, at least 1 ${CURRENCY} required to claim rewards.`
                            : ""
                        }
                        placement="top"
                        arrow
                      >
                        <div className={totalReward >= 1 ? "notDiabled" : "disabledlinks"}>
                          <Link
                            onClick={
                              totalReward >= 1
                                ? handleClaimRewards
                                : (e) => e.preventDefault()
                            }
                            className="bonds-btns btn-yellow"
                            aria-disabled={totalReward < 1}
                            tabIndex={totalReward < 1 ? -1 : 0}
                          >
                            <Typography variant="body3">Claim Rewards</Typography>
                          </Link>
                        </div>
                      </Tooltip>
                    </div>
                  </TableCell>
                ) : bondedData?.status == VALIDATOR_STATUS.INACTIVE ? (
                  <TableCell>
                    <div className="bond-actions">
                      <Link
                        to="/account/funds/bond"
                        className="bonds-btns btn-blue"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          border: "2px solid transparent",
                          borderRadius: "25px",
                          WebkitTransition: "color 0.2s ease-out, filter 0.2s ease-out",
                          transition: "color 0.2s ease-out, filter 0.2s ease-out",
                        }}
                      >
                        <Typography variant="body3">Bond</Typography>
                      </Link>

                      <Tooltip title={shouldShow ? message : ""} placement="top" arrow>
                        <div className={shouldShow ? "disabledlinks" : "notDiabled"}>
                          <Link
                            to={
                              shouldShow === false
                                ? "/account/funds/revalidation"
                                : "#"
                            }
                            className="bonds-btns btn-red"
                            key="/account/funds/revalidation"
                          >
                            <Typography variant="body3">Re-Validate</Typography>
                          </Link>
                        </div>
                      </Tooltip>

                      <Tooltip
                        title={totalReward < 1 ? "No claimable amount available." : ""}
                        placement="top"
                        arrow
                      >
                        <div className={totalReward >= 1 ? "notDiabled" : "disabledlinks"}>
                          <Link
                            onClick={
                              totalReward >= 1
                                ? handleClaimRewards
                                : (e) => e.preventDefault()
                            }
                            className="bonds-btns btn-blue"
                            aria-disabled={totalReward < 1}
                            tabIndex={totalReward < 1 ? -1 : 0}
                          >
                            <Typography variant="body3">Claim Rewards</Typography>
                          </Link>
                        </div>
                      </Tooltip>
                    </div>
                  </TableCell>
                ) : (
                  ""
                )}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {isLoading && (
          <div
            className="loader-container"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <Loader />
          </div>
        )}
      </div>
    </>
  );
};

export default BondTable;
