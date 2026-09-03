/*eslint-disable */
import { useSelector } from "react-redux";
import { Container } from "./styles";
import Card from "../../Common/Card";
import StakingIcon from "../../../assets/Icons/StakingIcon";
import { TotalValidatorIcon } from "../../../assets/Icons/SvgIcon.jsx";
import { toFixed } from "../../../utils/toFixed";

const ValidatorsInfo = () => {
  const { isSidebarOpen } = useSelector((state) => state?.drawer);
  const data = useSelector((state) => state?.auth);  
  return (
    <Container data-testid="container" isOpen={isSidebarOpen}>
      <Card icon={<TotalValidatorIcon />} title={"Total Validators"} value={data?.validatorCount?.count ? data?.validatorCount?.count : 0} />
      <Card icon={<StakingIcon />} title={"Staking APR"} value={data?.apr ? toFixed(data?.apr, 2) + "%" : "0%"} />
    </Container>
  );
};

export default ValidatorsInfo;
