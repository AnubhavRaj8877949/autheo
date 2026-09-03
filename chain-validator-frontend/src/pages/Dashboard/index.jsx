import { Typography } from "@mui/material";
import DashboardValidatorCard from "../../components/Dashboard/ValidatorCard";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <Typography variant="h3" component="h1" className="dashboard-page__title">
          Validator Overview
        </Typography>
        <Typography variant="body2" className="dashboard-page__subtitle">
          Node status, stake and network participation for your Autheo validator.
        </Typography>
      </header>

      <DashboardValidatorCard />
    </div>
  );
};

export default Dashboard;
