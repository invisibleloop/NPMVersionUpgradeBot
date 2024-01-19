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

describe('NPM Package Version Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  it.each([
    ['next', '10.0.0', '9.0.0'],
    ['@builder.io/partytown', '2.0.0', '1.0.0']
  ])('notifies on new version of %s', async (packageName, newVersion, oldVersion) => {
    // Mock the npm registry response for a new version
    nock('https://registry.npmjs.org')
      .get(`/${packageName}/latest`)
      .reply(200, { version: newVersion });

    // Mock Vercel KV to return an older version
    kv.get.mockResolvedValue(oldVersion);

    // Mock Slack API response
    nock('https://slack.com')
      .post('/api/chat.postMessage')
      .reply(200, { ok: true });

    const req = {};
    const res = { write: jest.fn(), end: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.write).toHaveBeenCalledWith(`New version of ${packageName === 'next' ? 'Next.js' : 'Partytown'} found and notified: ${newVersion}`);
    expect(kv.set).toHaveBeenCalledWith(`LAST_VERSION_${packageName}`, newVersion);
  });

  it.each([
    ['next', '9.0.0'],
    ['@builder.io/partytown', '1.0.0']
  ])('does not notify on same version for %s', async (packageName, currentVersion) => {
    nock('https://registry.npmjs.org')
      .get(`/${packageName}/latest`)
      .reply(200, { version: currentVersion });

    kv.get.mockResolvedValue(currentVersion);

    const req = {};
    const res = { write: jest.fn(), end: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.write).toHaveBeenCalledWith(`No new version for ${packageName === 'next' ? 'Next.js' : 'Partytown'}. Current latest version is ${currentVersion}`);
    expect(kv.set).not.toHaveBeenCalled();
  });
});
