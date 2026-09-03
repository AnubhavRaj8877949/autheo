import theme from "../../../theme";
import { CustomizedTextField } from "./styles";

const TextField = ({ ...props }) => {
  return (
    <CustomizedTextField
      {...props}
      InputLabelProps={{
        shrink: true,
      }}
      FormHelperTextProps={{
        error: props.error,
      }}
      inputProps={{
        style: { paddingRight: props.paddingRight },
        maxLength: props.maxlength,
        sx: {
          "&::placeholder": {
            color: "var(--text-muted)",
            opacity: 1,
            ...theme.typography.body2,
            lineHeight: 1.9,
          },
        },
      }}
    />
  );
};

export default TextField;
