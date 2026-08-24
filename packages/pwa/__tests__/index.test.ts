import * as PwaExports from '../src/index';

describe('PWA Index Exports', () => {
  it('exports client lifecycle utilities', () => {
    expect(PwaExports.initPwaLifecycle).toBeDefined();
  });
});
