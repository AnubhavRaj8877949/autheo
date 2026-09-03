import { Grid, Typography } from "@mui/material";
import {
  LinkedinIcon,
  TelegramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "../../assets/Icons/SvgIcon";
import {
  APP_NAME,
  BASE_URL,
  FOOTER_LINKS,
  SOCIAL_LINKS,
} from "../../constants";
import logo from "../../assets/Images/logo.svg";
import {
  Copyright,
  FooterItem,
  FooterItemInner,
  FooterSection,
  SocialLinks,
  SocialLinksInner,
} from "./styles";



const FooterLink = ({ href, children }) => {
  if (!href || href === "#" || href === "") {
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{
          display: "inline-flex",
          color: "var(--text-muted)",
          cursor: "not-allowed",
        }}
      >
        {children}
      </Typography>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
const Footer = () => {
  return (
    <FooterItem component="footer" className="app-footer">
      <FooterItemInner>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} lg={4}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                <img src={logo} alt="logo" className="logo" />
              </Typography>
              <Typography variant="body2">
                Run and manage {APP_NAME || ""} validator nodes: stake, monitor
                node health, and take part in transaction verification and block
                production on the {APP_NAME || ""} network.
              </Typography>
            </FooterSection>
          </Grid>
          <Grid item xs={12} sm={6} lg={1.5}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              {/* {BASE_URL.EXPLORER_NAVIGATION_URL && ( */}
              <>
                <FooterLink
                  href={`${BASE_URL.EXPLORER_NAVIGATION_URL}tokens`}

                >
                  Tokens
                </FooterLink>
                <FooterLink
                  href={`${BASE_URL.EXPLORER_NAVIGATION_URL}txs`}

                >
                  Transaction
                </FooterLink>

              </>
              {/* )} */}
            </FooterSection>
          </Grid>
          <Grid item xs={12} sm={6} lg={1.5}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                About Us
              </Typography>
              {/* {FOOTER_LINKS.PRIVACY_POLICY && ( */}
              <FooterLink
                href={FOOTER_LINKS.PRIVACY_POLICY}

              >
                Privacy Policy
              </FooterLink>
              {/* )} */}
              {/* {FOOTER_LINKS.TERMS_OF_SERVICE && ( */}
              <FooterLink
                href={FOOTER_LINKS.TERMS_OF_SERVICE}
              >
                Terms of Service
              </FooterLink>
              {/* )} */}
            </FooterSection>
          </Grid>
          {/* <Grid item xs={12} md={6} lg={2}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
             
              <FooterLink
                href={FOOTER_LINKS.DELEGATOR_APP}
              >
                {APP_NAME ? `${APP_NAME} Delegator App` : "Delegator App"}
              </FooterLink>

            </FooterSection>
          </Grid> */}
          <Grid item xs={12} sm={6} lg={3}>
            <FooterSection>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>

              <FooterLink
                href={FOOTER_LINKS.OFFICIAL_WEB}
              >
                autheo.com
              </FooterLink>
              <FooterLink
                href={FOOTER_LINKS.NETWORK_DOCS}
              >
                {APP_NAME
                  ? `${APP_NAME} Network Docs`
                  : "Network Docs"}
              </FooterLink>

              <FooterLink
                href={FOOTER_LINKS.DOCS}
              >
                {APP_NAME ? `${APP_NAME} Docs` : "Docs"}
              </FooterLink>
              <FooterLink
                href={FOOTER_LINKS.GITHUB}
              >
                GitHub
              </FooterLink>
            </FooterSection>
          </Grid>
        </Grid>
        <SocialLinks>
          <Typography variant="h6" gutterBottom>
            Get in touch!
          </Typography>
          <SocialLinksInner>
            <FooterLink
              href={SOCIAL_LINKS.TWITTER}
            >
              <TwitterIcon />
            </FooterLink>
            <FooterLink
              href={SOCIAL_LINKS.TELEGRAM}
            >
              <TelegramIcon />
            </FooterLink>
            
            

            <FooterLink
              href={SOCIAL_LINKS.LINKEDIN}
            >
              <LinkedinIcon />
            </FooterLink>

            <FooterLink
              href={SOCIAL_LINKS.YOUTUBE}
            >
              <YoutubeIcon />
            </FooterLink>
          </SocialLinksInner>
        </SocialLinks>
        <Copyright>
          <Typography variant="body2">
            &copy;{new Date().getFullYear() || "2026"} Copyright {APP_NAME}. All
            rights reserved.
          </Typography>
        </Copyright>
      </FooterItemInner>
    </FooterItem>
  );
};

export default Footer;
