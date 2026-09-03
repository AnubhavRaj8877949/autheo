import { toast } from "../components/Common/Toast/Toast";
import { MIN_BOND_AMOUNT, WALLET_TYPE } from "../constants";

export const handleNext = (
  values,
  activeStep,
  setActiveStep,
  bal,
  fee,
  walletType
) => {
  switch (activeStep) {
    case 0:
      if (
        values?.name === "" ||
        values?.name?.length < 3 ||
        values?.name?.length > 25
      ) {
        toast.error("Name should be min 3 & max 25 character long");
        return;
      }

       if(values?.details){
        if (values?.details?.length < 10 || values?.details?.length > 60) {
          toast.error("Description should be min 10 & max 60 character long");
          return;
        }
       }
      const urlRegex = /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

      if (values?.website) {
        if (!urlRegex.test(values.website)) {
          toast.error("Please enter a valid website URL.");
          return;
        }

        if (values.website.length > 140) {
          toast.error("Website URL must be under 140 characters.");
          return;
        }
      }
         if(values?.identity){
          if (values?.identity?.length < 5 || values?.identity?.length > 20) {
            toast.error("Identity should be min 5 & max 20 character long");
            return;
          }
         }

      if (values?.securityContact && (values?.securityContact.length < 5 || values?.securityContact.length > 50)) {
        toast.error("Security contact should be min 5 & max 50 character long");
        return;
      } else {
        return setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    case 1: {
      if (values?.Bond_Amount === "") {
        toast.error("Enter Bond Amount");
        return;
      }
      if (
        Number(bal) < Number(fee) ||
        Number(bal) < Number(MIN_BOND_AMOUNT) + Number(fee)
      ) {
        toast.error("Low wallet Balance");
        return;
      }
      if (Number(values?.Bond_Amount) < Number(MIN_BOND_AMOUNT)) {
        toast.error(
          `Bond amount should be equal or greater than ${MIN_BOND_AMOUNT} `
        );
        return;
      }
      if (Number(values?.Bond_Amount) > Number(bal)) {
        toast.error(`Stake Amount should be less than ${bal}`);
        return;
      }
      if (Number(values?.commissionRate) < 5 || Number(values?.commissionRate) > 100) {
        toast.error("Commission initial rate should be between 5 to 100");
        return;
      }
      if (Number(values?.maxRate) < Number(values?.commissionRate) || Number(values?.maxRate) > 100) {
        toast.error(`Commission max rate should be between ${values?.commissionRate} to 100`);
        return;
      }
      const allowedChange = Number(values?.maxRate) - Number(values?.commissionRate);
      if (Number(values?.maxChangeRate) < 0 || Number(values?.maxChangeRate) > allowedChange) {
        toast.error(`Commission change rate should be between 0 to ${allowedChange.toFixed(2)} (Max Rate - Initial Rate)`);
        return;
      }
      if (walletType === WALLET_TYPE.NO_WALLET) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        return;
      }

      return true;
    }
    default:
      return;
  }
};

export const bondMoreValidations = (e, setErrMsg, userBalance) => {
  let { name, value } = e.target;
  if (name === "Bond_Amount") {
    setErrMsg((prev) => ({ ...prev, amount: "" }));
    if (!value) {
      setErrMsg((prev) => ({ ...prev, amount: "Enter bond amount" }));
      return;
    }
    if (Number(value) >= Number(userBalance)) {
      setErrMsg((prev) => ({
        ...prev,
        amount: "You have insufficient balance",
      }));
      return;
    }
    if (Number(value) <= 0) {
      setErrMsg((prev) => ({
        ...prev,
        amount: "Bonded amount must be greater than 0",
      }));
      return;
    }
  }
  if (name === "Unbond_Amount") {
    setErrMsg((prev) => ({ ...prev, amount: "" }));
    
    if (!value) {
      setErrMsg((prev) => ({ ...prev, amount: "Enter unbonding amount" }));
      return;
    }

    if (Number(value) >= Number(userBalance/10**18)) {
      setErrMsg((prev) => ({
        ...prev,
        amount: "You have insufficient bonded amount",
      }));
      return;
    }
    if (Number(value) <= 0) {
      setErrMsg((prev) => ({
        ...prev,
        amount: "unbonding amount must be greater than 0",
      }));
      return;
    }
  } else if (name === "Mnemonics") {
    setErrMsg((prev) => ({ ...prev, mnemonics: "" }));
    if (!value) {
      setErrMsg((prev) => ({ ...prev, mnemonics: "Enter mnemonics" }));
      return;
    }
  }
};
