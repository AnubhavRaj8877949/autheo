import { IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import InfoIcon from "../../../assets/Icons/InfoIcon";
import { MainCard, SecondaryCard } from "./styles";

const Card = ({ title, value, icon, tooltipContent, loading }) => (
  <MainCard className="vaildator-card">
    <span className="vaildator-card__icon">{icon}</span>
    <div className="vaildator-card__main">
      <div>
        <Typography variant="h5" sx={{ fontWeight: 700, minWidth: "75px" }}>
          {title}
        </Typography>
        {tooltipContent && (
          <Tooltip
            className="vaildator-card__tooltip"
            placement="top"
            arrow
            title={
              <Typography variant="h6" padding={1}>
                {tooltipContent}
              </Typography>
            }
          >
            <IconButton className="infoIcon">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <SecondaryCard>
        <Typography
          variant="h4"
          sx={{
            wordBreak: "break-all",
            fontSize: 14,
            color: (theme) => theme.palette.text.primary,
          }}
        >
          {loading ? (
            <Skeleton
              data-testid="skeleton"
              variant="circle"
              width={100}
              height={20}
            />
          ) : (
            value
          )}
        </Typography>
      </SecondaryCard>
    </div>
  </MainCard>
);

export default Card;
