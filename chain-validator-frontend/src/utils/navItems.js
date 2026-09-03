import BlocksIcon from "../assets/Icons/BlocksIcon";
import LoginIcon from "../assets/Icons/LoginIcon";
import ValidatorIcon from "../assets/Icons/ValidatorIcon";
import DashboardIcon from "../assets/Icons/DashboardIcon";
import AccountIcon from "../assets/Icons/AccountIcon";
import RewardIcon from "../assets/Icons/RewardIcon";

export const notLoggedInRoutes = [
  {
    path: "/login",
    Icon: LoginIcon,
    label: "Log In",
  },
  {
    path: "/blocks",
    Icon: BlocksIcon,
    label: "Blocks",
  },
  {
    path: "/validators",
    Icon: ValidatorIcon,
    label: "Validators",
  },
  {
    path: "/genesis-reward-program",
    Icon: RewardIcon,
    label: "Genesis Reward Program",
  },
];

export const loggedInRoutes = [
  {
    path: "/dashboard",
    Icon: DashboardIcon,
    label: "Dashboard",
  },
  {
    path: "/blocks",
    Icon: BlocksIcon,
    label: "Blocks",
  },
  {
    path: "/validators",
    Icon: ValidatorIcon,
    label: "Validators",
  },
  {
    path: "/genesis-reward-program",
    Icon: RewardIcon,
    label: "Genesis Reward Program",
  },
  {
    Icon: AccountIcon,
    label: "Manage Account",
    // hasSubLinks: true,

    path: "/account",
    subLinks: [
      {
        label: "Account",
        path: "/account/profile",
      },
      {
        label: "funds",
        path: "/account/funds",
      },
    ],
  },
];
