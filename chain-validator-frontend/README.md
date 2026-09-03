# Autheo Validator

The **Autheo Validator** application is the operator console for Autheo validator
nodes. It lets a node operator authenticate their deployed node, onboard as a
validator, stake THEO, and monitor node status, rewards and network
participation.

It is built on the **Cosmos SDK** stack (Tendermint RPC + a Cosmos REST API,
with an EVM JSON-RPC alongside it) and signs through the Keplr and Cosmostation
wallet extensions.

The application provides a clean user interface for:

- Connecting to the Cosmos network
- Viewing validator performance and uptime
- Staking and delegation management
- Real-time updates via WebSocket or RPC
- Transaction and account tracking
- Node and governance insights

It's designed to be scalable, fast, and easy to integrate with any Cosmos SDK-based chain.

##

## Folder Structure

```
your-project/
├── public/
│   └── index.html
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

Follow these steps to clone and run the application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
```

### 2. Move into the Project Directory

```bash
cd your-repo-name
```

```Checkout to prod branch
git checkout testnet
```

```Checkout to new branch from prod
git checkout -b Branch_Name
```

### 3. Install Dependencies

```bash
npm install
# use --f flag if you find error while installing the packages.
# or
yarn install
```

### 4. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the required variables before starting the server.

### 5. Start the Development Server

```bash
npm start
# or
yarn start
```

Your app will now be running at:

```
http://localhost:3000
```

---

## Requirements

- Node.js (version 16 or above recommended)
- npm or yarn

---

## Available Scripts

In the project directory, you can run:

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm start`     | Runs the app in development mode |
| `npm run build` | Builds the app for production    |

---
---

## Design system

All colour, type, spacing, radius and elevation live in one place:

| File | Purpose |
| ---- | ------- |
| `src/styles/_autheo-tokens.scss` | Autheo brand constants, scales, semantic tokens, and the `--theme-*` bridge consumed by the older style modules |
| `src/styles/_autheo-components.scss` | Component layer: buttons, inputs, tables, tabs, badges, status, modals, toasts, empty/loading states, responsive guards |
| `src/styles/brand.js` | The same brand values for the few JS consumers that cannot read CSS custom properties (the MUI palette in `src/theme.js`) |

Rules:

- **Never hardcode a colour, font size or spacing value in a component.** Use a
  token (`var(--brand-primary)`, `var(--font-size-sm)`, `var(--space-4)`, …).
- Both stylesheets are imported once, at the top of `src/Styles.scss`.
- The brand palette comes from [autheo.com](https://www.autheo.com/): teal
  `#00FED9`, gold `#F0B90B`, "dazzle" ground `#0B0C17`, Inter type family.
- The official Autheo wordmark (`src/assets/Images/logo.svg`) and mark
  (`LogoSmall.svg`, `resLogo.svg`, `assets/Icons/LogoIcon.jsx`) must not be
  redrawn, recoloured, stretched or filtered. On light surfaces the header and
  footer give the lockup a dazzle plate rather than recolouring it.

### Validator status

Node and transaction state is rendered by one shared component,
`src/components/Common/StatusBadge`. Every state carries three independent
signals — a `--status-*` colour, a dot shape (filled / hollow / square /
spinning ring) and the spelled-out label — so status never depends on colour
alone. Add new states to `STATUS_META` there and to the
`.autheo-status--<state>` modifiers in `_autheo-components.scss`.

---

## Environment configuration

`.env` separates two kinds of value, and the file itself is annotated:

- **Branding / display** (`REACT_APP_NAME`, `REACT_APP_CURRENCY`, public links,
  social links) — safe to edit; affects copy only.
- **Network** (`REACT_APP_CHAIN_ID`, `REACT_APP_DENOM`,
  `REACT_APP_ADDRESS_PREFIX`, RPC / REST / explorer URLs, contract addresses)
  and `Chain/config.json` — functional. These must match the chain the build
  talks to; changing them independently breaks signing and address derivation.
