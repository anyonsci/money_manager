import * as DcExports from '../src/index';

describe('DC Client - Index Exports', () => {
  it('exports all dc-client services, adapters, context, endpoints, and storage', () => {
    expect(DcExports.api).toBeDefined();
    expect(DcExports.apiClient).toBeDefined();
    expect(DcExports.dcAuthStorage).toBeDefined();
    expect(DcExports.getStoredAccessToken).toBeDefined();
    expect(DcExports.LedgerTranspilerService).toBeDefined();
    expect(DcExports.DcLedgerStorageAdapter).toBeDefined();
    expect(DcExports.dcLedgerStorageAdapter).toBeDefined();
    expect(DcExports.WorkspaceProvider).toBeDefined();
    expect(DcExports.useWorkspace).toBeDefined();
  });
});
