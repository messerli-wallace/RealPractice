const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: false,
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
};
