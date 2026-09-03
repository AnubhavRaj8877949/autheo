import { useMediaQuery } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Statistics from "../Statistics";
import theme from "../../theme";
import { toggleSidebar } from "../../redux/reducer/drawer";
import { Container, Wrapper } from "./styles";
import Footer from "../Footer/Footer";

const MainPanel = ({ children }) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const styles = {
    paperContainer: {
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top center ",
      backgroundSize: "cover",
    },
  };

  const location = useLocation();
  const { pathname } = location;

  const showStats =
    !pathname?.includes("/account") &&
    !pathname?.includes("/funds/bond") &&
    !pathname?.includes("/funds/unbond") &&
    !pathname?.includes("/funds/redelegate") &&
    !pathname?.includes("/genesis-reward-program") &&
    !pathname?.includes("/login");

  useEffect(() => {
    dispatch(toggleSidebar(!isMobile));
  }, [dispatch, isMobile]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <Wrapper>
        {/* <Sidebar
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />{" "} */}
        <Container style={styles.paperContainer} ismobile={`${isMobile}`}>
          {/* {isMobile && (
            <MenuIcon
              className="open-icon"
              sx={{
                color: theme.palette.text.primary,
                fill: theme.palette.text.primary,
              }}
              onClick={openSidebar}
            />
          )} */}
          {/*
          {showSearchbar && (
            <Searchbar>
              <TextField
                variant="outlined"
                placeholder="Search by TX Hash/ Address/ Block/ Block Hash"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Magnifier />
                    </InputAdornment>
                  ),
                }}
              />
            </Searchbar>
          )}
          */}
          {showStats && <Statistics />}
          {children}
        </Container>
        <Footer />
      </Wrapper>
    </>
  );
};

export default MainPanel;
