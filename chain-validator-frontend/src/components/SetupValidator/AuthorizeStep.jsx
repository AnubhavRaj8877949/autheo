/* eslint-disable */

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import TextField from "../Common/TextField";
import FormWrapper from "../Common/FormWrapper";
import BackButton from "../BackButton/BackButton";
import { useGetNodeUrl } from "../../context/NodeUrl";
import createValidator from "../../services/createValidator";
import { useDispatch, useSelector } from "react-redux";
import CommonBtn from "../Common/CommonBtn/CommonBtn";
import { DirectSecp256k1HdWallet } from "@cosmjss/proto-signing";
import editValidator from "../../services/editValidator";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { BackIcon } from "../../assets/Icons/SvgIcon.jsx";
import { toast } from "../Common/Toast/Toast";
import { isTxOccur } from "../../redux/reducer/auth";
import { PREFIX, ROUTE_PATHS } from "../../constants";
import { HD_PATHS } from "../../utils/helper";

const AuthorizeValidatorTransaction = ({
  setActiveStep,
  primaryValues,
  methodType,
  secondaryValues,
  setOpen,
  setIsLoading,
  hideCommissionField,
  setEditSuccess,
}) => {
  const [showButton, setShowButton] = useState(true);
  const [mnemonics, setMnemonics] = useState("");
  const { nodeUrl } = useGetNodeUrl();
  const { userAddress } = useSelector((state) => state.auth);
  const valoperAddress = useSelector((state) => state?.auth?.valoperAddress);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const { valoperAddressFromBlockChain } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  let publicKey = localStorage.getItem("publicKey") || "";
  const submit = async () => {
    try {
      if (!mnemonics) {
        toast.error("Enter Mnemonics");
        return;
      }

      if (methodType === "createValidator") {
        if (mnemonics?.length > 0) {
          const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonics, {
            hdPaths: HD_PATHS,
            prefix: PREFIX,
          });
          const [{ address: senderAddress }] = await wallet.getAccounts();
          if (senderAddress?.length > 0 && senderAddress === userAddress) {
            setLoader(true);
            const res = await createValidator(
              mnemonics,
              primaryValues,
              secondaryValues,
              nodeUrl,
              valoperAddressFromBlockChain
            );
            setTimeout(() => {
              dispatch(isTxOccur(true));
              if (res?.code == 0) {
                setLoader(false);
                navigate(ROUTE_PATHS.DASHBOARD);
                toast.success("Transaction Successful");
                return;
              } else {
                if (res && res?.rawLog?.includes("failed")) {
                  let msg = res?.rawLog?.split(
                    "failed to execute message; message index: 0:"
                  );
                  toast.error(msg[1]);
                } else {
                  toast.error(res?.rawLog);
                }
                setLoader(false);
                return navigate(ROUTE_PATHS.DASHBOARD);
              }
            }, 3000);
          } else {
            setLoader(false);
            return toast.error("Mnemonics are not same as Login Mnemonics");
          }
        }
      } else if (methodType === "editValidator") {
        if (mnemonics?.length > 0) {
          try {
            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
              mnemonics,
              { hdPaths: HD_PATHS, prefix: PREFIX }
            );
            const [{ address: senderAddress }] = await wallet.getAccounts();
            if (
              senderAddress?.length > 0 &&
              senderAddress === userAddress &&
              valoperAddress?.length > 0
            ) {
              setIsLoading(true);
              const res = await editValidator(
                mnemonics,
                primaryValues,
                nodeUrl,
                valoperAddress,
                hideCommissionField
              );
              setTimeout(() => {
                dispatch(isTxOccur(true));
                if (res && res?.rawLog?.includes("failed")) {
                  let msg = res?.rawLog?.split(
                    "failed to execute message; message index: 0:"
                  );
                  setOpen(false);
                  setActiveStep(0);
                  setIsLoading(false);
                  toast.error(msg[1]);
                  return;
                } else {
                  setOpen(false);
                  setActiveStep(0);
                  setIsLoading(false);
                  setEditSuccess(true);
                  toast.success("Transaction Successful");
                  return;
                }
              }, 3000);
            } else {
              setIsLoading(false);
              return toast.error("Mnemonics are not same as Login Mnemonics");
            }
          } catch (err) {
            setIsLoading(false);
            toast.error(err?.message);
            return err;
          }
        }
      }
    } catch (err) {
      // console.log(err);
      toast.error(err?.message);
    }
  };

  const goBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleMnemonicsInput = (e) => {
    let val = e.target.value.trim();
    setMnemonics(val);
    if (val) {
      setShowButton(false);
    } else {
      setShowButton(true);
    }
  };
  return loader ? (
    <Loader />
  ) : (
    <FormWrapper>
      <div className="common-wrapper" style={{ marginTop: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <BackButton onClick={() => goBack()} title={<BackIcon />} />
          <Typography variant="h5" style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            Authorize Transaction
          </Typography>
        </div>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="20px"
          mb="24px"
        >
          {secondaryValues && methodType === "createValidator" && (
            <div>
              <Typography color="text.primary" fontWeight="700">
                Stake/Bond Amount:{" "}
                <Box component="span" color="text.primary" fontWeight="400">
                  {secondaryValues?.Bond_Amount}
                </Box>
              </Typography>
              <Typography color="text.primary" fontWeight="700" mt="8px">
                Commission Percentage:{" "}
                <Box component="span" color="text.primary" fontWeight="400">
                  {secondaryValues.commissionRate}%
                </Box>
              </Typography>
            </div>
          )}
        </Box>
        <TextField
          label="Enter Mnemonics key to authorize the transaction"
          placeholder="Paste or enter your mnemonics"
          value={mnemonics}
          autoComplete="off"
          onChange={(e) => {
            handleMnemonicsInput(e);
          }}
          type="password"
        />
        {/* <Button
          variant="contained"
          fullWidth
          sx={{
            marginTop: "28px",
          }}
          onClick={submit}

        >
          sign and submit
        </Button> */}
        <div style={{ paddingTop: "20px" }}>
          {" "}
          <CommonBtn
            children="Sign and Submit"
            onClick={submit}
            color="primary"
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default AuthorizeValidatorTransaction;
