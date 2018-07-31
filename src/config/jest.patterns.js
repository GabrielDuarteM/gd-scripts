// @ts-check

const testMatch = ["**/*.test.ts", "**/*.test.js"]
const testIgnores = [
  "node_modules/",
  "fixtures/",
  "__tests__/helpers/",
  "__mocks__",
]

module.exports = {
  testMatch,
  testIgnores,
}