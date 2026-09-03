module.exports = {
  testEnvironment: '<rootDir>/jest.environment.js',
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  moduleNameMapper: {
    "\\.(css|sass|scss)$": "identity-obj-proxy",
    "\\.svg$": "<rootDir>/mocks/svgMock.js",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/mocks/fileMock.js",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/mocks/",
    "/src/proto-types-gen/",
    "/src/assets/Icons/SvgIcon\\.jsx$",
    "/src/assets/Icons/",
    "/src/constants\\.ts$",
    "/src/utils/toFixed\\.js$",


    // Ignore all style-related files
    "\\.css$",
    "\\.scss$",
    "\\.sass$",
    "\\.less$",
    "\\.styl$",
    "\\.module\\.css$",
    "\\.module\\.scss$",
    "\\.module\\.sass$",
    "/styles/",
    "/styles\\.js$",
    "/styles\\.jsx$",
    ".*\\.styles\\.js$",
    ".*\\.styles\\.jsx$",
    ".*/styles\\.js$",
    ".*/styles\\.jsx$"
  ],
  testMatch: ["<rootDir>/tests/**/*.(test|spec).{js,jsx}"],
};
