import {puppeteerLauncher} from '@web/test-runner-puppeteer';
import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['src/**/*_test.ts'],
  coverage: true,
  coverageConfig: {
    reporters: ['lcov']
  },
  browsers: [
    puppeteerLauncher({concurrency: 1})
  ],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'auto',
      tsconfig: './tsconfig.json'
    })
  ],
  testFramework: {
    config: {
      ui: 'tdd'
    }
  }
};
