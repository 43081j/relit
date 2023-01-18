import {puppeteerLauncher} from '@web/test-runner-puppeteer';
import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['src/**/*_test.ts'],
  coverage: true,
  coverageConfig: {
    reporters: ['lcov', 'html']
  },
  browsers: [
    puppeteerLauncher()
  ],
  plugins: [
    esbuildPlugin({ts: true, target: 'auto'})
  ],
  testFramework: {
    config: {
      ui: 'tdd'
    }
  }
};
