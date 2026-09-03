import { Tooltip, Typography } from "@mui/material";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";

/**
 * Autheo validator / transaction status badge.
 *
 * Single source of truth for how a node or transaction state is presented.
 * Every state carries three independent signals so status is never conveyed
 * by colour alone (WCAG 1.4.1):
 *
 *   1. colour        - from the --status-* design tokens
 *   2. a dot shape   - filled / hollow / square / spinning ring, via the
 *                      `.autheo-status--<state>` modifiers in
 *                      styles/_autheo-components.scss
 *   3. the label     - the state name is always spelled out
 *
 * A tooltip explains what the state means.
 *
 * The map below covers the full Autheo node-state vocabulary. Only the states
 * the API actually reports are ever rendered - nothing here invents a state.
 */
const STATUS_META = {
  active: {
    label: "Active",
    hint: "Node is bonded and participating in transaction verification and block production.",
  },
  healthy: {
    label: "Healthy",
    hint: "Node is online and keeping up with the network.",
  },
  bonded: {
    label: "Bonded",
    hint: "Stake is bonded to this validator.",
  },
  pending: {
    label: "Pending",
    hint: "Waiting to be included in the active set.",
  },
  syncing: {
    label: "Syncing",
    hint: "Node is still catching up to the current block height.",
  },
  processing: {
    label: "Processing",
    hint: "Submitted and awaiting confirmation.",
  },
  unbonding: {
    label: "Unbonding",
    hint: "Stake is unbonding and is not securing the network.",
  },
  deactivating: {
    label: "Deactivating",
    hint: "Node is being withdrawn from the active set.",
  },
  maintenance: {
    label: "Maintenance",
    hint: "Node is intentionally out of service.",
  },
  warning: {
    label: "Warning",
    hint: "Node is running but a check needs attention.",
  },
  inactive: {
    label: "Inactive",
    hint: "Node is not in the active set and is not earning rewards.",
  },
  offline: {
    label: "Offline",
    hint: "Node is not reachable and is not signing blocks.",
  },
  jailed: {
    label: "Jailed",
    hint: "Node has been removed from the active set by the protocol.",
  },
  error: { label: "Error", hint: "The operation did not complete." },
  failed: { label: "Failed", hint: "The operation did not complete." },
  success: { label: "Success", hint: "Completed and confirmed on-chain." },
};

/**
 * `deactivating` reads as a wind-down, so it uses the error/critical treatment
 * to match how the app has always coloured it.
 */
const StatusBadge = ({ status, showTooltip = true, className = "", ...rest }) => {
  const key = String(status || "").toLowerCase();
  const meta = STATUS_META[key];

  if (!key) {
    return (
      <Typography variant="body2" component="span" {...rest}>
        -
      </Typography>
    );
  }

  const badge = (
    <span
      className={`autheo-status autheo-status--${key} ${className}`.trim()}
      data-status={key}
      {...rest}
    >
      {meta?.label || capitalizeFirstLetter(key)}
    </span>
  );

  if (!showTooltip || !meta?.hint) return badge;

  return (
    <Tooltip
      className="tooltip-common"
      placement="top"
      arrow
      title={
        <Typography variant="h6" padding={1}>
          {meta.hint}
        </Typography>
      }
    >
      {badge}
    </Tooltip>
  );
};

export { STATUS_META };
export default StatusBadge;
