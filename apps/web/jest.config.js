const baseConfig = require('@4basearch/config/jest');

module.exports = {
  ...baseConfig,
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@ui/(.*)$': '<rootDir>/../storybook/stories/atomic/$1',
  },
};
