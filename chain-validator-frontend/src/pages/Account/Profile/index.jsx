import { Paper, Typography, Box, Button, Tooltip, IconButton, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LOADING_STATES, editValidatorInput, WALLET_TYPE, ROUTE_PATHS, VALIDATOR_STATUS } from "../../../constants";
import "./styles";
import Modal from "@mui/material/Modal";
import FirstStep from "../../../components/SetupValidator/FirstStep";
import AuthorizeValidatorTransaction from "../../../components/SetupValidator/AuthorizeStep";
import BondTable from "../../../components/Funds/ManageAccount/BondTable";
import { ProfileDetails } from "../../Validators/EachValidator/styles";
import "./style.css";
import { useEffect, useState, useCallback } from "react";
import Address from "../../Validators/EachValidator/Address";
import ProfileTable from "../../../components/Profile/ProfileTable";
import getValidatorByAddress from "../../../services/apis/getValidatorByAddress";
import {
  checkIfValidatorExist,
  getBondedBalance,
  getValoperAddress,
} from "../../../redux/reducer/auth";
import { isOptionDisable } from "../../../utils/commissionEditTimer";
import {
  WalletAddress,
  HeadingItems,
  ProfileWrap,
  Profiledata,
} from "./styles";
import { keplrEditValidator } from "../../../keplrEvents/keplrEditValidator";
import { showEVMAddress } from "../../../services/showEVMAddress";
import { cosmostationEditValidator } from "../../../cosmostationEvents/editValidator";
import InfoIcon from "../../../assets/Icons/InfoIcon";
import { ValidatorOnboardingModal } from "../../../components/ValidatorOnboarding";
import { getOnboardingWindowStatus } from "../../../services/apis/validatorOnboarding";
import { storeValidatorType } from "../../../constants/validatorOnboarding";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "calc(100dvh - 32px)",
  overflowY: "auto",
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};
const Profile = () => {
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [profileStatus, setProfileStatus] = useState(LOADING_STATES.INIT);
  const [isLoading, setIsLoading] = useState(false);
  const authState = useSelector((state) => state?.auth);
  const { userAddress, isValidated, walletType } = authState || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showIcon] = useState(true);
  const [primaryValues, setPrimaryValues] = useState({
    name: "",
    details: "",
    website: "",
    identity: "",
    securityContact: "",
    CommissionRate: "",

  });
  const [hideCommissionField, setHideCommissionField] = useState(false);
  const [evmAddress, setEvmAddress] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const valoperAddress = useSelector((state) => state?.auth?.valoperAddress);

  const handleOpen = () => {
    setOpen(true);

  };
  const handleClose = useCallback(() => {
    setOpen(false);
    setActiveStep(0);
    setIsLoading(false);
  }, []);
  const fetchData = useCallback(async () => {
    try {
      if (userAddress || editSuccess === true) {
        setProfileStatus(LOADING_STATES.FETCHING);
        const response = await getValidatorByAddress(userAddress);
        if (response?.error === false) {
          setProfileData(response?.data?.validators[0]);
          
          const bondingData = {
            bondedAmount: response?.data?.validators[0]?.selfStake,
            unbondedAmount: response?.data?.validators[0]?.unbondingAmount,
          };
          dispatch(
            getValoperAddress(response?.data?.validators[0]?.operatorAddress)
          );
          dispatch(checkIfValidatorExist(true));
          dispatch(getBondedBalance(bondingData));
          setProfileStatus(LOADING_STATES.SUCCESS);
        } else {
          dispatch(checkIfValidatorExist(false));
          setProfileStatus(LOADING_STATES.ERROR);
        }
      }
    } catch (err) {
      setProfileStatus(LOADING_STATES.ERROR);
      dispatch(checkIfValidatorExist(false));
      return err;
    }
  }, [userAddress, editSuccess, dispatch]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    setPrimaryValues({
      name: profileData?.name,
      details: profileData?.details,
      website: profileData?.website,
      identity: profileData?.identity,
      securityContact: profileData?.securityContact,
      CommissionRate: profileData?.commissionRate
        ? (profileData?.commissionRate).toString()
        : "",
      commissionMaxRate: profileData?.commissionMaxRate,
      commissionMaxChangeRate: profileData?.commissionMaxChangeRate,

    });
  }, [profileData]);

  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleOnboardingProceed = (validatorType) => {
    storeValidatorType(validatorType);
    navigate(ROUTE_PATHS.ACCOUNT_BECOME_VALIDATOR);
  };

  const handleBecomeValidator = async () => {
    if (typeof fetch !== "function") {
      navigate(ROUTE_PATHS.ACCOUNT_BECOME_VALIDATOR);
      return;
    }

    try {
      const { isOpen } = await getOnboardingWindowStatus();
      if (isOpen) {
        setOnboardingOpen(true);
      } else {
        navigate(ROUTE_PATHS.ACCOUNT_BECOME_VALIDATOR);
      }
    } catch {
      navigate(ROUTE_PATHS.ACCOUNT_BECOME_VALIDATOR);
    }
  };

  useEffect(() => {
    if (profileData?.commissionUpdateTime) {
      let date = profileData?.commissionUpdateTime;
      if (isOptionDisable(date, 1)) {
        setHideCommissionField(true);
      } else {
        setHideCommissionField(false);
      }
    }
  }, [profileData]);

  const editValidtor = useCallback(() => {
    if (window?.keplr && walletType === WALLET_TYPE.KEPLR) {
      keplrEditValidator(primaryValues, valoperAddress, setIsLoading, navigate, profileData, handleClose);
    } else if (window?.cosmostation && walletType === WALLET_TYPE.COSMOSTATION) {
      cosmostationEditValidator(
        primaryValues,
        valoperAddress,
        setIsLoading,
        navigate
      );
    }
  }, [walletType, primaryValues, valoperAddress, navigate, profileData, handleClose]);

  useEffect(() => {
    if (activeStep === 1 && walletType !== WALLET_TYPE.NO_WALLET) {
      editValidtor();
    }
  }, [activeStep, walletType, editValidtor]);

  useEffect(() => {
    const fetchAddress = () => {
      if (userAddress) {
        const address = showEVMAddress(userAddress);
        setEvmAddress(address);
      }
    };

    fetchAddress();
  }, [userAddress]);

  const isFetching =
    isLoading ||
    profileStatus === LOADING_STATES.INIT ||
    profileStatus === LOADING_STATES.FETCHING;

  return (
    <>
      <ValidatorOnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        walletAddress={userAddress}
        onProceed={handleOnboardingProceed}
      />
      <HeadingItems>
        <Typography
          variant="h3"
          mb="20px"
          display={"flex"}
          justifyContent={"space-between"}
        >
          {isFetching ? (
            <Skeleton variant="text" width={200} height={40} />
          ) : profileStatus === LOADING_STATES.SUCCESS && isValidated ? (
            <>Profile Details </>
          ) : (
            <p className="manageHead">Manage Account</p>
          )}

          {!isFetching &&
            profileStatus === LOADING_STATES.SUCCESS &&
            isValidated &&
            profileData?.status !== VALIDATOR_STATUS.DEACTIVATING &&
            profileData?.status !== VALIDATOR_STATUS.INACTIVE && (
              <span>
                {/* <button
              onClick={handleOpen}
              className="editbutton"
              style={{
                color: "#fff",
                padding: "14px 30px",
                background: " linear-gradient(to right, var(--brand-primary) 50%, var(--brand-primary-strong) 100% )",
                borderRadius: "15px",
                display: "flex",
                gap: "20px",
                border: 0,
              }}
            >
              {" "}
              Edit Validator
              <EditIcon style={marginleft12} />
            </button> */}
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="parent-modal-title"
                  aria-describedby="parent-modal-description"
                  style={{
                    backdropFilter: "blur(5px)",
                    // backgroundColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Box
                    sx={{
                      ...style,
                      width: { xs: "94vw", sm: 560 },
                      // background: "#121212",
                      // borderRadius: "10px",
                      border: 0,
                      padding: 0,
                      outline: "none",
                    }}
                  >
                    {(() => {
                      switch (activeStep) {
                        case 0:
                          return (
                            <FirstStep
                              primaryValues={primaryValues}
                              setPrimaryValues={setPrimaryValues}
                              setActiveStep={setActiveStep}
                              activeStep={activeStep}
                              methodType="editValidator"
                              profileData={profileData}
                              hideCommissionField={hideCommissionField}
                            />
                          );
                        case 1:
                          if (walletType === WALLET_TYPE.NO_WALLET) {
                            return (
                              <AuthorizeValidatorTransaction
                                setActiveStep={setActiveStep}
                                primaryValues={primaryValues}
                                methodType="editValidator"
                                setOpen={setOpen}
                                setIsLoading={setIsLoading}
                                hideCommissionField={hideCommissionField}
                                setEditSuccess={setEditSuccess}
                              />
                            );
                          }
                          return <></>;
                        default:
                          return <></>;
                      }
                    })()}
                  </Box>
                </Modal>
              </span>
            )}
        </Typography>
      </HeadingItems>

      {isFetching ? (
        <>
          <div className="bond-wrapper">
            <Skeleton
              variant="rectangular"
              height={80}
              sx={{ borderRadius: "20px", marginBottom: "20px" }}
            />
          </div>
          <Paper
            className="manageAccountDetails"
            sx={{
              p: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ProfileDetails key={index}>
                <Typography color="text.secondary" variant="body2" sx={{ width: '408px' }}>
                  <Skeleton variant="text" width={150} height={20} />
                </Typography>
                <Typography>
                  <Skeleton variant="text" width={250} height={25} />
                </Typography>
              </ProfileDetails>
            ))}
          </Paper>
          <Box sx={{ mt: "30px" }}>
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: "20px" }}
            />
          </Box>
          <Box className="account-card" sx={{ mt: "20px" }}>
            <Skeleton
              variant="rectangular"
              height={250}
              sx={{ borderRadius: "20px" }}
            />
          </Box>
        </>
      ) : profileStatus === LOADING_STATES.SUCCESS && isValidated ? (
        <>
          <div className="bond-wrapper">
            <Typography component="div" className="bond-wrapper__title bond-wrapper__title--flex validator-address">
              <WalletAddress>
                <div className="walletInnerData">
                  <Typography>Wallet Address:</Typography>
                  <Address address={evmAddress ? evmAddress : userAddress} />
                </div>
                <button onClick={handleOpen} className="editbutton">
                  Edit Validator
                </button>
              </WalletAddress>
            </Typography>
          </div>
          <Paper className="manageAccountDetails">
            {editValidatorInput?.map((item) => {
              const value = profileData?.[item?.name];
              if (!value) return null;
              return (
                <ProfileDetails key={item?.id}>
                  <Typography color="text.secondary" variant="body2">
                    {item?.label}
                  </Typography>
                  <Typography>{value}</Typography>
                </ProfileDetails>
              );
            })}
            <ProfileDetails>
              <Typography color="text.secondary" variant="body2">
                Commission Rate
              </Typography>
              <Typography>
                {profileData?.commissionRate
                  ? (Number.parseFloat(profileData.commissionRate) * 100)
                    .toFixed(2)
                    .replace(/\.?0+$/, "")
                  : 0}
                %
              </Typography>
            </ProfileDetails>
            <ProfileDetails>
              <Typography color="text.secondary" variant="body2">
                Commission Max Rate
              </Typography>
              <Typography>
                {profileData?.commissionMaxRate
                  ? (Number.parseFloat(profileData.commissionMaxRate) * 100)
                    .toFixed(2)
                    .replace(/\.?0+$/, "")
                  : 0}
                %
              </Typography>
            </ProfileDetails>
            <ProfileDetails>
              <Typography color="text.secondary" variant="body2">
                Commission Max Change Rate
              </Typography>
              <Typography>
                {profileData?.commissionMaxChangeRate
                  ? (Number.parseFloat(profileData.commissionMaxChangeRate) * 100)
                    .toFixed(2)
                    .replace(/\.?0+$/, "")
                  : 0}
                %
              </Typography>
            </ProfileDetails>
          </Paper>
          <ProfileTable profileData={profileData} />
          <Box className="account-card">
            <BondTable bondedData={profileData} fetchData={fetchData} />
          </Box>
        </>
      ) : (
        <ProfileWrap className="profile-wrap">
          <div className="backProfilebtn">
            <h3>Profile Details</h3>
          </div>
          <Box className="profile-wrap__item profiledata">
            <Typography> Wallet Address:</Typography>
            <br />
            <Address
              address={evmAddress ? evmAddress : userAddress}
              showIcon={showIcon}
            />
          </Box>

          <Profiledata className="profile-wrap__item profile-wrap__item--status">
            <Typography>Validator Status:</Typography>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button
                className="transparentbtn"
                variant="contained"
                fullWidth
                onClick={handleBecomeValidator}
                sx={{
                  maxWidth: "240px",
                }}
              >
                Onboard as a Validator
              </Button>
              <Tooltip
                className="tooltip-common"
                placement="top"
                arrow
                title={
                  <Typography variant="h6" padding={1}>
                    Shows whether your validator node is active and participating in block validation.
                    Only active validators can propose blocks and earn rewards.

                  </Typography>
                }
              >
                <IconButton className="infoIcon">{<InfoIcon />}</IconButton>
              </Tooltip>
            </div>
          </Profiledata>
        </ProfileWrap>
      )}
    </>
  );
};

export default Profile;
