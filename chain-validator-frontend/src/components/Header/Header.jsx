import React, { useState } from "react";
import logo from "../../assets/Images/logo.svg";
import { Descktop, Drawersidebar, Mobilereasponsive } from "./styles";
import { Drawer } from "@mui/material";
import HeaderItems from "./HeaderItems";
import "./Header.css";
import MenuIcon from "../../assets/Icons/MenuIcon";
import { useTheme } from "../../context/ThemeContext";
import SunIcon from "../../assets/Icons/SunIcon";
import MoonIcon from "../../assets/Icons/MoonIcon";
function Header() {
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isDarkTheme, toggleTheme } = useTheme();
  const toggleDrawer = (newOpen) => () => {
    setIsDrawerOpen(true);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        className="drawerCustom"
      >
        <Drawersidebar>
          <HeaderItems onNavigate={() => setIsDrawerOpen(false)} />
        </Drawersidebar>
      </Drawer>
      <Descktop Descktop>
        <HeaderItems />
      </Descktop>
      <Mobilereasponsive>
        <div className="mobileresponsive headerWrapper">
          <img src={logo} alt="logo" className="logo" />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={
                isDarkTheme ? "Switch to light mode" : "Switch to dark mode"
              }
              title={
                isDarkTheme ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkTheme ? <SunIcon /> : <MoonIcon />}
            </button>
            <MenuIcon className="open-icon" onClick={toggleDrawer(true)} />
          </div>
        </div>
      </Mobilereasponsive>
    </>
  );
}

export default Header;
