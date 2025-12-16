module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  testTimeout: 10000
};