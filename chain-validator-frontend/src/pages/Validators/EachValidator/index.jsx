/*eslint-disable*/
import { Paper, Skeleton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ValidatorDetailItem, WalletAdd } from "./styles";
import { useEffect, useState } from "react";
import { BackIcon } from "../../../assets/Icons/SvgIcon.jsx";
import moment from "moment";
import Address from "./Address";
import { CURRENCY } from "../../../constants";
import StatusBadge from "../../../components/Common/StatusBadge";
import BackButton from "../../../components/BackButton/BackButton";
import getValidatorByAddress from "../../../services/apis/getValidatorByAddress";
import Loader from "../../../components/Loader/Loader";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import { formatMillionNumber, noExponential } from "../../../utils/commonFunctions";
import { toFixed } from "../../../utils/toFixed";
import { data } from "browserslist";
import { showEVMAddress } from "../../../services/showEVMAddress";

const ValidatorDetails = () => {
  const params = useParams();
  const address = params?.address;
  const navigate = useNavigate();
  const [validatorDetail, setValidatorDetail] = useState({});
  const [detailStatus, setDetailStatus] = useState("Init");
  const [evmAddress, setEvmAddress] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDetailStatus("Fetching");
        const response = await getValidatorByAddress(address);
        setValidatorDetail(response?.data?.validators[0]);
        setDetailStatus("Success");
      } catch (err) {
        setDetailStatus("Error");
        return err;
      }
    };
    fetchData();
  }, [address]);

  useEffect(() => {
    const fetchAddress = () => {
      if (validatorDetail?.validatorAddress) {
        const address = showEVMAddress(validatorDetail.validatorAddress);
        setEvmAddress(address);
      }
    };

    fetchAddress();
  }, [validatorDetail?.validatorAddress]);

  return (
    <>
      <Typography
        variant="h3"
        mb="20px"
        display={"flex"}
        sx={{
          paddingTop: "20px",
          gap: "10px",
          color: "var(--theme-text-primary)",
        }}
      >
        <span style={{ cursor: "pointer" }} onClick={goBack}>
          <BackIcon />
        </span>
        Validator Details
      </Typography>
      <>
        <WalletAdd>
          <Typography
            component="div"
            className="bond-wrapper__title bond-wrapper__title--flex validator-address"
          >
            <Typography>Wallet Address:</Typography>
            {detailStatus === "Init" || detailStatus === "Fetching" ? (
              <Skeleton variant="text" width={300} height={25} />
            ) : (
              <Address
                address={
                  evmAddress ? evmAddress : validatorDetail?.validatorAddress
                }
              />
            )}
          </Typography>
        </WalletAdd>
        <Paper>
          {detailStatus === "Init" || detailStatus === "Fetching" ? (
            // Skeleton Loaders for All Fields
            <>
              {Array.from({ length: 9 }).map((_, index) => (
                <ValidatorDetailItem key={index}>
                  <Typography color="text.secondary" variant="body2">
                    <Skeleton variant="text" width={150} height={25} />
                  </Typography>
                  <Typography>
                    <Skeleton variant="text" width={200} height={25} />
                  </Typography>
                </ValidatorDetailItem>
              ))}
            </>
          ) : (
            <>

              {validatorDetail?.name && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Name
                  </Typography>
                  <Typography>
                    {capitalizeFirstLetter(validatorDetail.name)}
                  </Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.details && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Description
                  </Typography>
                  <Typography>{validatorDetail.details}</Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.website && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Website
                  </Typography>
                  <Typography>{validatorDetail.website}</Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.identity && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Identity
                  </Typography>
                  <Typography>{validatorDetail.identity}</Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.SecurityContact && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Security Contact
                  </Typography>
                  <Typography>{validatorDetail.SecurityContact}</Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.status && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Status
                  </Typography>
                  <StatusBadge status={validatorDetail.status} />
                </ValidatorDetailItem>
              )}

              {validatorDetail?.totalStake && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Total Stake
                  </Typography>
                  <Typography>
                    {formatMillionNumber(noExponential(Number(validatorDetail.totalStake) / 10 ** 18))} {CURRENCY}
                  </Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.selfStake && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Self Stake
                  </Typography>
                  <Typography>
                    {formatMillionNumber(noExponential(Number(validatorDetail.selfStake) / 10 ** 18))} {CURRENCY}
                  </Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.createdAt && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Validator Since
                  </Typography>
                  <Typography>
                    {moment(validatorDetail.createdAt).format("YYYY/MM/DD")}
                  </Typography>
                </ValidatorDetailItem>
              )}

              {validatorDetail?.delegatorCount > 0 && (
                <ValidatorDetailItem>
                  <Typography color="text.secondary" variant="body2">
                    Delegators
                  </Typography>
                  <Typography>{validatorDetail.delegatorCount}</Typography>
                </ValidatorDetailItem>
              )}



            </>
          )}
        </Paper>
        <div style={{ height: "20px" }}></div>

        <Paper>
          {detailStatus === "Init" || detailStatus === "Fetching" ? (
            // Skeleton Loaders for All Fields
            <>
              {Array.from({ length: 9 }).map((_, index) => (
                <ValidatorDetailItem key={index}>
                  <Typography color="text.secondary" variant="body2">
                    <Skeleton variant="text" width={150} height={25} />
                  </Typography>
                  <Typography>
                    <Skeleton variant="text" width={200} height={25} />
                  </Typography>
                </ValidatorDetailItem>
              ))}
            </>
          ) : (
            <>






              <ValidatorDetailItem>
                <Typography color="text.secondary" variant="body2">
                  Commission Rate
                </Typography>
                <Typography>
                  {validatorDetail?.commissionRate
                    ? noExponential(toFixed(validatorDetail?.commissionRate, 4) * 100)
                    : 0}
                  %
                </Typography>
              </ValidatorDetailItem>
              <ValidatorDetailItem>
                <Typography color="text.secondary" variant="body2">
                  Commission Max Rate
                </Typography>
                <Typography>
                  {validatorDetail?.commissionMaxRate
                    ? noExponential(
                      toFixed(validatorDetail?.commissionMaxRate, 4) * 100
                    )
                    : 0}
                  %
                </Typography>
              </ValidatorDetailItem>
              <ValidatorDetailItem>
                <Typography color="text.secondary" variant="body2">
                  Commission Change Rate
                </Typography>
                <Typography>
                  {validatorDetail?.commissionMaxChangeRate
                    ? noExponential(
                      toFixed(validatorDetail?.commissionMaxChangeRate, 4) * 100
                    )
                    : 0}
                  %
                </Typography>
              </ValidatorDetailItem>

            </>
          )}
        </Paper>
      </>
    </>
  );
};

export default ValidatorDetails;
