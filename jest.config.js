module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
},

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
