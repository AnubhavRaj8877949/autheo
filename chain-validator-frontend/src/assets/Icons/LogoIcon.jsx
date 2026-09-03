import { SvgIcon } from "@mui/material";

/**
 * Autheo brand mark.
 *
 * Geometry is the official Autheo "A" mark, taken verbatim from the
 * wordmark published at autheo.com/logos/autheo-logo.svg. Do not redraw,
 * stretch or recolour it - pass `sx`/`fontSize` to resize only.
 */
const LogoIcon = (props) => {
  return (
    <SvgIcon viewBox="0 0 30.3593 23" {...props}>
      <path
        d="M0 23H6.58648L8.24582 19.7858H13.3323V15.0707H10.9229L15.0845 7.35602L19.2749 14.9644L16.8125 15.1769L16.974 19.8389H21.8458L23.5605 23H30.3593L17.8833 0.123965H12.4229L0 23Z"
        fill="#00FED9"
      />
    </SvgIcon>
  );
};

export default LogoIcon;
