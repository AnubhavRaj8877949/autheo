/* eslint-disable */
import { IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ValidatorTable from "./ValidatorTable";
import ActionTable from "./ActionTable";
import FlexBox from "../../../components/Common/FlexBox";
import { Container, ValidatorButton } from "./styles";
import { useNavigate } from "react-router-dom";
import BlockchainInfos from "../../../components/Dashboard/BlockchainInfos";
import {
  checkIfValidatorExist,
  getValoperAddress,
} from "../../../redux/reducer/auth";
import getValidatorByAddress from "../../../services/apis/getValidatorByAddress";
import { useDispatch, useSelector } from "react-redux";
import InfoIcon from "../../../assets/Icons/InfoIcon";
import { ROUTE_PATHS } from "../../../constants";
import { ValidatorOnboardingModal } from "../../ValidatorOnboarding";
import StatusBadge from "../../Common/StatusBadge";
import { getOnboardingWindowStatus } from "../../../services/apis/validatorOnboarding";
import { storeValidatorType } from "../../../constants/validatorOnboarding";

const DashboardValidatorCard = () => {
  const navigate = useNavigate();
  const { userAddress, isValidated } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  const [dasboardData, setDashboardData] = useState([]);
  const [, setDashboardStatus] = useState("Init");
  const [walletActivitiesLength, setWalletActivitiesLength] = useState(0);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleOnboardingProceed = (validatorType) => {
    storeValidatorType(validatorType);
    navigate(ROUTE_PATHS.ACCOUNT_BECOME_VALIDATOR);
  };

  const setUpValidate = async () => {
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
    const fetchData = async () => {
      try {
        if (userAddress) {
          setDashboardStatus("Fetching");
          const response = await getValidatorByAddress(userAddress);

          if (response?.error === false) {
            setDashboardData(response?.data?.validators[0]);
            dispatch(
              getValoperAddress(response?.data?.validators[0]?.operatorAddress)
            );
            //TODO: change into  false  if  enable  setup as validator
            dispatch(checkIfValidatorExist(true));
            setDashboardStatus("Success");
          } else {
            dispatch(checkIfValidatorExist(false));
            setDashboardStatus("Error");
          }
        }
      } catch (err) {
        setDashboardStatus("Error");
        dispatch(checkIfValidatorExist(false));
        return err;
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <ValidatorOnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        walletAddress={userAddress}
        onProceed={handleOnboardingProceed}
      />

      <Container className="validator-overview" style={{ background: "transparent", position: "relative" }}>
        <section className="validator-status common-table">
          <div className="validator-status__card">
            <FlexBox className="validator-status__headline">
              <Typography variant="h4" component="h2" className="validator-status__label">
                Validator Status
              </Typography>
              {isValidated ? (
                <StatusBadge status={dasboardData?.status} />
              ) : (
                <span className="validator-status__empty">Not onboarded</span>
              )}
              <Tooltip
                className="tooltip-common"
                placement="top"
                arrow
                title={
                  <Typography variant="h6" padding={1}>
                    Shows whether your validator node is in the active set and
                    taking part in block production. Only active validators
                    propose blocks and earn validator rewards.
                  </Typography>
                }
              >
                <IconButton className="infoIcon" aria-label="About validator status">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </FlexBox>

            {isValidated === false && (
              <ValidatorButton onClick={setUpValidate}>
                Onboard as a Validator
              </ValidatorButton>
            )}
          </div>

          {isValidated === true && (
            <ValidatorTable dasboardData={dasboardData} />
          )}
        </section>
      </Container >
      <BlockchainInfos />
      <Container style={{ background: "transparent" }}>
        <div className="recentHeader">
          <Typography variant="h4" component="h2" className="section-title">
            Recent Wallet Activities
          </Typography>
          {walletActivitiesLength > 5 && (
            <button
              className="view-all viewAllBtn"
              onClick={() => navigate(ROUTE_PATHS.WALLET_ACTIVITIES)}
            >
              View All
            </button>
          )}
        </div>

        <section className=" common-table" style={{ width: "100%" }}>
          <ActionTable setWalletActivitiesLength={setWalletActivitiesLength} />
        </section>
      </Container>
    </>
  );
};

export default DashboardValidatorCard;
