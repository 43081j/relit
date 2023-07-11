import {puppeteerLauncher} from '@web/test-runner-puppeteer';

export default {
  nodeResolve: true,
  files: ['lib/**/*_test.js'],
  coverage: true,
  coverageConfig: {
    reporters: ['lcov']
  },
  browsers: [puppeteerLauncher()],
  plugins: [],
  testFramework: {
    config: {
      ui: 'tdd'
    }
  }
};
