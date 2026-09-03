/*eslint-disable*/
import { Typography } from "@mui/material";
import ValidatorsInfo from "../../components/Validators/ValidatorsInfo";
import ValidatorsTableList from "../../components/Validators/ValidatorsTableList";
import { ValidatorsCard } from "./EachValidator/styles";

const Validators = () => {
  return (
    <ValidatorsCard>
      <Typography variant="h3" mb={3}>
        Validators
      </Typography>
      <ValidatorsInfo />
      <ValidatorsTableList />
    </ValidatorsCard>
  );
};

export default Validators;
