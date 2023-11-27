const nock = require('nock');
const handler = require('../api/nextJS');
const { kv } = require('@vercel/kv');

// Mock for Vercel KV
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

describe('Next.js Version Checker', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();

    // Reset nock before each test
    nock.cleanAll();
  });

  it('notifies on new version', async () => {
    // Mock the npm registry response for a new version
    nock('https://registry.npmjs.org')
      .get('/next/latest')
      .reply(200, { version: '10.0.0' });

    // Mock Vercel KV to return an older version
    require('@vercel/kv').kv.get.mockResolvedValue('9.0.0');

    // Mock Slack API response
    nock('https://slack.com')
      .post('/api/chat.postMessage')
      .reply(200, { ok: true });

    // Mock req and res objects
    const req = {};
    const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    // Run the handler
    await handler(req, res);

    // Assert that a new version notification was sent
    expect(res.send).toHaveBeenCalledWith('New version of Next.js found and notified: 10.0.0');
    expect(require('@vercel/kv').kv.set).toHaveBeenCalledWith('LAST_VERSION', '10.0.0');
  });

  it('does not notify on same version', async () => {
    const currentVersion = '9.0.0';

    // Mock the npm registry response for the current version
    nock('https://registry.npmjs.org')
      .get('/next/latest')
      .reply(200, { version: currentVersion });

    // Mock Vercel KV to return the current version
    kv.get.mockResolvedValue(currentVersion);

    // Mock req and res objects
    const req = {};
    const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    // Run the handler
    await handler(req, res);

    // Assert that no new version notification was sent
    expect(res.send).toHaveBeenCalledWith(`No new version. Current latest version is ${currentVersion}`);
    expect(kv.set).not.toHaveBeenCalled();
  });
});
