import { LoaderDots } from "../../assets/Icons/SvgIcon";
const Loader = () => {
  return (

      <div
        style={{
          height: "100vh",
          width: "100%",
          backgroundColor: "#181919",
          overflow: "hidden",
          zIndex: 10000000000,
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "35px",
        }}
      >
        <div className="lottieIcon">
          <LoaderDots />
        </div>
      </div>

  );
};

export default Loader;
