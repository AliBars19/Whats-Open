import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/lib/hours.ts",
    "src/lib/geo.ts",
    "src/lib/utils.ts",
    "src/lib/constants.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  projects: [
    {
      displayName: "unit",
      testEnvironment: "node",
      preset: "ts-jest",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testMatch: ["<rootDir>/src/__tests__/lib/**/*.test.ts"],
    },
    {
      displayName: "components",
      testEnvironment: "jsdom",
      preset: "ts-jest",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testMatch: ["<rootDir>/src/__tests__/components/**/*.test.tsx"],
    },
  ],
};

export default config;
