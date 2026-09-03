/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../../src/components/Footer/Footer";
import { BASE_URL } from "../../../src/constants.ts";

import { APP_NAME } from "../../../src/constants";

// Mock SVG Icons
jest.mock("../../../src/assets/Icons/SvgIcon", () => ({
  CmcIcon: () => <div data-testid="cmc-icon" />,
  DiscordIcon: () => <div data-testid="discord-icon" />,
  InstaIcon: () => <div data-testid="insta-icon" />,
  LinkedinIcon: () => <div data-testid="linkedin-icon" />,
  SocialIcon: () => <div data-testid="social-icon" />,
  TelegramIcon: () => <div data-testid="telegram-icon" />,
  TwitterIcon: () => <div data-testid="twitter-icon" />,
  YoutubeIcon: () => <div data-testid="youtube-icon" />,
}));

// Mock MUI Link to avoid React Router issues
jest.mock("@mui/material/Link", () => (props) => (
  <a {...props}>{props.children}</a>
));

// Prevent console errors/warnings
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => { });
  jest.spyOn(console, "warn").mockImplementation(() => { });
});

afterAll(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
});

// Helper function to validate URL format
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Check if URL starts with http:// or https://
  const hasProtocol = /^https?:\/\//i.test(url);

  // Check if URL has a valid TLD (.com, .ai, .work, .io, .org, .net, etc.)
  const hasValidTLD = /\.(com|ai|work|io|org|net|co|dev|app|tech|info|biz|me|tv|cc|xyz|online|site|store|blog|cloud|digital|email|global|host|link|live|network|news|space|today|world|zone|academy|agency|business|center|city|company|education|enterprises|expert|foundation|group|institute|international|management|media|network|partners|photography|plus|press|productions|services|solutions|studio|support|systems|technology|training|university|ventures|works|zone|gg|ly|be|de|fr|uk|us|ca|au|in|jp|cn|br|ru|mx|es|it|nl|se|no|dk|fi|pl|tr|kr|tw|hk|sg|my|th|id|ph|vn|nz|za|ae|sa|eg|ng|ke|gh|tz|ug|zm|zw|bw|mw|na|sz|ls|mu|sc|re|yt|km|mg|mz|ao|cd|cg|cm|cf|td|ga|gq|st|gw|gn|sl|lr|ci|bf|ml|ne|sn|gm|mr|cv|bi|rw|dj|so|et|er|sd|ss|ly|tn|dz|ma|eh)\b/i.test(url);

  return hasProtocol && hasValidTLD;
};

describe("Footer Component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test("renders logo section and text", () => {
    expect(
      screen.getByText(
        new RegExp(`${APP_NAME} validator nodes`, "i")
      )
    ).toBeInTheDocument();
  });

  describe("Quick Links section", () => {
    test("renders Quick Links heading", () => {
      expect(screen.getByText("Quick Links")).toBeInTheDocument();
    });

    test("all Quick Links have valid URLs", () => {
      const tokensLink = screen.getByText("Tokens").getAttribute("href");
      const transactionLink = screen.getByText("Transaction").getAttribute("href");

      expect(isValidUrl(tokensLink)).toBe(true);
      expect(isValidUrl(transactionLink)).toBe(true);
    });
  });

  describe("About Us section", () => {
    test("renders About Us heading", () => {
      expect(screen.getByText("About Us")).toBeInTheDocument();
    });

    test("Privacy Policy has valid URL", () => {
      const privacyPolicyLink = screen.getByText("Privacy Policy").getAttribute("href");
      expect(isValidUrl(privacyPolicyLink)).toBe(true);
    });

    test("Terms of Service has valid URL", () => {
      const termsLink = screen.getByText("Terms of Service").getAttribute("href");
      expect(isValidUrl(termsLink)).toBe(true);
    });
  });

  // The Products / Delegator App section is currently commented out in
  // Footer.jsx; re-add these tests alongside it if it comes back.

  describe("Resources section", () => {
    test("renders Resources heading", () => {
      expect(screen.getByText("Resources")).toBeInTheDocument();
    });

    test("autheo.com has valid URL", () => {
      const officialWebLink = screen.getByText("autheo.com").getAttribute("href");
      expect(isValidUrl(officialWebLink)).toBe(true);
    });

    test("Network Docs has valid URL", () => {
      const networkDocsLink = screen.getByText(`${APP_NAME} Network Docs`).getAttribute("href");
      expect(isValidUrl(networkDocsLink)).toBe(true);
    });

    test("Docs has valid URL", () => {
      const docsLink = screen.getByText(`${APP_NAME} Docs`).getAttribute("href");
      expect(isValidUrl(docsLink)).toBe(true);
    });

    test("GitHub has valid URL", () => {
      const githubLink = screen.getByText("GitHub").getAttribute("href");
      expect(isValidUrl(githubLink)).toBe(true);
    });
  });

  describe("Social Links section", () => {
    test("renders Get in touch heading", () => {
      expect(screen.getByText("Get in touch!")).toBeInTheDocument();
    });

    test("renders all social icons", () => {
      expect(screen.getByTestId("twitter-icon")).toBeInTheDocument();
      expect(screen.getByTestId("telegram-icon")).toBeInTheDocument();
      expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();
      expect(screen.getByTestId("youtube-icon")).toBeInTheDocument();
    });

    test("all social links have valid URLs", () => {
      ["twitter", "telegram", "linkedin", "youtube"].forEach(
        (channel) => {
          const href = screen
            .getByTestId(`${channel}-icon`)
            .parentElement.getAttribute("href");
          expect(isValidUrl(href)).toBe(true);
        }
      );
    });
  });

  test("renders copyright", () => {
    expect(
      screen.getByText(/Copyright .* All rights reserved\./)
    ).toBeInTheDocument();
  });

  test("no console warnings or errors", () => {
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });
});

// Negative test cases
describe("Footer Component - Negative Tests", () => {
  describe("URL Validation - Invalid URLs", () => {
    test("should reject URLs without protocol", () => {
      expect(isValidUrl("www.example.com")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
    });

    test("should reject URLs without valid TLD", () => {
      expect(isValidUrl("https://example")).toBe(false);
      expect(isValidUrl("http://example")).toBe(false);
    });

    test("should reject invalid URL formats", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl(123)).toBe(false);
    });

    test("should reject URLs with only protocol", () => {
      expect(isValidUrl("https://")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
    });

    test("should reject malformed URLs", () => {
      expect(isValidUrl("https:/example.com")).toBe(false);
      expect(isValidUrl("https//example.com")).toBe(false);
      expect(isValidUrl("https:example.com")).toBe(false);
    });
  });

  describe("URL Validation - Valid URLs", () => {
    test("should accept URLs with http protocol and common TLDs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("http://example.org")).toBe(true);
      expect(isValidUrl("http://example.net")).toBe(true);
    });

    test("should accept URLs with https protocol and common TLDs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://example.org")).toBe(true);
      expect(isValidUrl("https://example.net")).toBe(true);
    });

    test("should accept URLs with modern TLDs", () => {
      expect(isValidUrl("https://example.ai")).toBe(true);
      expect(isValidUrl("https://example.work")).toBe(true);
      expect(isValidUrl("https://example.io")).toBe(true);
      expect(isValidUrl("https://example.dev")).toBe(true);
      expect(isValidUrl("https://example.app")).toBe(true);
      expect(isValidUrl("https://example.tech")).toBe(true);
    });

    test("should accept URLs with subdomains", () => {
      expect(isValidUrl("https://www.example.com")).toBe(true);
      expect(isValidUrl("https://subdomain.example.com")).toBe(true);
      expect(isValidUrl("https://deep.subdomain.example.com")).toBe(true);
    });

    test("should accept URLs with paths", () => {
      expect(isValidUrl("https://example.com/path")).toBe(true);
      expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
      expect(isValidUrl("https://example.com/path?query=value")).toBe(true);
    });
  });
});
