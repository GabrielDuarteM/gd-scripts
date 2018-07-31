// @ts-check

const path = require("path")
const { testMatch, testIgnores } = require("./jest.patterns")
const { hasFile, hasPkgProp } = require("../utils")

const here = p => path.join(__dirname, p)

const useBuiltInBabelConfig = !hasFile(".babelrc") && !hasPkgProp("babel")

const jestConfig = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  collectCoverageFrom: ["src/**/*.+(js|ts)"],
  testMatch,
  testPathIgnorePatterns: [...testIgnores],
  coveragePathIgnorePatterns: [...testIgnores, "src/(umd|cjs|esm)-entry.js$"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
}

if (useBuiltInBabelConfig) {
  jestConfig.transform = { "^.+\\.(j|t)s$": here("./babel-transform") }
}

module.exports = jestConfig
