import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  //setupFilesAfterEnv: ['./tests/setupTests.ts'],
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$":["ts-jest", { "tsconfig": "tsconfig.json" }],

  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage:true,
  collectCoverageFrom:['<rootDir>/src/**/*.ts'],
  clearMocks:true,
  resetMocks:true,
  restoreMocks:true
 
};

export default config;

