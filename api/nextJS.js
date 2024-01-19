const axios = require('axios');
const { kv } = require('@vercel/kv');

// Array of packages to check
const packages = [
  {
    name: 'next',
    displayName: 'Next.js',
    changelogUrl: (version) => `https://github.com/vercel/next.js/releases/tag/v${version}`,
  },
  {
    name: '@builder.io/partytown',
    displayName: 'Partytown',
    changelogUrl: (version) => `https://github.com/BuilderIO/partytown/releases/tag/v${version}`,
  },
];

async function handler(req, res) {
  const SLACK_TOKEN = process.env.SLACK_TOKEN;
  const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

  const sendMessageToSlack = async (packageName, displayName, latestVersion, changelogLink) => {
    const npmLink = `https://www.npmjs.com/package/${packageName}/v/${latestVersion}`;
  
    const message = `New version of ${displayName} available: ${latestVersion}\nCheck it out on npm: ${npmLink}\nView the specific changelog: ${changelogLink}`;

    try {
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: SLACK_CHANNEL,
        text: message
      }, {
        headers: { Authorization: `Bearer ${SLACK_TOKEN}` }
      });
      console.log(`Message sent to Slack for ${displayName}:`, message);
    } catch (error) {
      console.error(`Error sending message to Slack for ${displayName}:`, error.response ? error.response.data : error.message);
      res.status(500).send('Error sending message to Slack');
    }
  };

  for (const package of packages) {
    try {
      const latestVersionResponse = await axios.get(`https://registry.npmjs.org/${package.name}/latest`);
      const latestVersion = latestVersionResponse.data.version;

      const lastVersionKey = `LAST_VERSION_${package.name}`;
      let lastVersion = await kv.get(lastVersionKey);

      if (latestVersion !== lastVersion) {
        await sendMessageToSlack(package.name, package.displayName, latestVersion, package.changelogUrl(latestVersion));
        await kv.set(lastVersionKey, latestVersion);
        res.write(`New version of ${package.displayName} found and notified: ${latestVersion}\n`);
      } else {
        res.write(`No new version for ${package.displayName}. Current latest version is ${latestVersion}\n`);
      }
    } catch (error) {
      console.error(`Error for ${package.displayName}:`, error.message);
      res.write(`An error occurred for ${package.displayName}\n`);
    }
  }

  res.end();
}

module.exports = handler;
