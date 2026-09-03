import { useState, useEffect, useCallback } from "react";
import InfoIcon from "../../../assets/Icons/InfoIcon";
import { Typography, IconButton, Tooltip } from "@mui/material";

const CountdownTimer = ({ unbondingTime }) => {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const difference = new Date(unbondingTime) - now;

    if (difference <= 0) {
      return { expired: true };
    }

    return {
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }, [unbondingTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (timeLeft.expired) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, calculateTimeLeft]);

  return (
    <div>
      {!timeLeft.expired && (
        <>
          <h4>{timeLeft.minutes}m</h4>:<h4>{timeLeft.seconds}s</h4>
          <Tooltip
            className="tooltip-common"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                {
                  "This count represents the cooling-off period after a user deactivates their account. Once this period is over, the user will be able to perform tasks like bonding, unbonding, and setup validator again."
                }
              </Typography>
            }
          >
            <IconButton className="infoIcon">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
