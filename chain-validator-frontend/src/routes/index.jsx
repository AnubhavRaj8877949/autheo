import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import MainPanel from "../components/MainPanel";
import WalletActivities from "../components/RecentWallet/WalletActivities";
import PrivateRouter from "./PrivateRouter";
import TxDetails from "../pages/TxDetails";

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const BlocksPage = lazy(() => import("../pages/Blocks"));
const Validators = lazy(() => import("../pages/Validators"));
const Profile = lazy(() => import("../pages/Account/Profile"));
const Funds = lazy(() => import("../pages/Account/Funds"));
const Bond = lazy(() => import("../pages/Account/Funds/Bond"));
const UnBond = lazy(() => import("../pages/Account/Funds/UnBond"));
const ManageAccount = lazy(() =>
  import("../pages/Account/Funds/ManageAccount")
);
const SetupValidator = lazy(() => import("../pages/Account/SetupValidator"));
const ValidatorDetails = lazy(() =>
  import("../pages/Validators/EachValidator/index")
);
const AuthorizeTransaction = lazy(() =>
  import("../pages/Account/Funds/Authorize/index")
);
const GenesisRewardProgram = lazy(() =>
  import("../pages/GenesisRewardProgram")
);
const RoutePath = () => {
  const { isLoggedIn, isEligibleForRewardProgram } = useSelector((state) => state.auth);

  return (
    <MainPanel>
      <Suspense fallback>
        <Routes>
          <Route
            path="/login"
            element={
              !isLoggedIn ? <Login /> : <Navigate to="/dashboard" replace />
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/blocks" element={<BlocksPage />} />
          <Route path="/validators" element={<Validators />} />
          {isLoggedIn && isEligibleForRewardProgram && (
            <Route path="/genesis-reward-program" element={<GenesisRewardProgram />} />
          )}
          <Route
            path="/validators/:address"
            element={
              <PrivateRouter>
                <ValidatorDetails />
              </PrivateRouter>
            }
          />
          <Route
            path="/tx/:txId"
            element={
              <PrivateRouter>
                <TxDetails />
              </PrivateRouter>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRouter>
                <Profile />
              </PrivateRouter>
            }
          />
          <Route
            path="/account/profile"
            element={
              <PrivateRouter>
                <Profile />
              </PrivateRouter>
            }
          />
          <Route
            path="/account/become-a-validator"
            element={
              <PrivateRouter>
                <SetupValidator />
              </PrivateRouter>
            }
          />
          <Route
            path="/account/funds"
            element={
              <PrivateRouter>
                <Funds />
              </PrivateRouter>
            }
          >
            <Route path="/account/funds" index element={<ManageAccount />} />
            <Route path="/account/funds/bond" element={<Bond />} />
            <Route path="/account/funds/unbond" element={<UnBond />} />
            <Route
              path="/account/funds/stopvalidator"
              element={<AuthorizeTransaction />}
            />
            <Route
              path="/account/funds/revalidation"
              element={<AuthorizeTransaction />}
            />
            {/* <Route path="/account/funds/stop-deactivating" element={<AuthorizeTransaction />} /> */}
          </Route>
          <Route
            path="/dashboard"
            element={
              <PrivateRouter>
                <Dashboard />
              </PrivateRouter>
            }
          />
          <Route
            path="/wallet-activities"
            element={
              <PrivateRouter>
                <WalletActivities />
              </PrivateRouter>
            }
          />
          <Route path="*" element={<Navigate to="/blocks" replace />} />
        </Routes>
      </Suspense>
    </MainPanel>
  );
};

export default RoutePath;
