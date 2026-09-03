import CopyIcon from "../../../assets/Icons/CopyIcon";
import { toast } from "../../../components/Common/Toast/Toast";

export function Copy({ text }) {


  function onCopy() {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  return (
    <span
      onClick={onCopy}
      className="copy-btn"
      style={{
        marginLeft: "8px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <CopyIcon sx={{ fontSize: "17px" }} />
    </span>
  );
}
