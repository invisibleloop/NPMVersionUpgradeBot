import axios from 'axios';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const PACKAGE_NAME = 'next';
  const SLACK_TOKEN = process.env.SLACK_TOKEN;
  const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

  const sendMessageToSlack = async (latestVersion) => {
    const npmLink = `https://www.npmjs.com/package/next/v/${latestVersion}`;
    const changelogLink = `https://github.com/vercel/next.js/releases/tag/v${latestVersion}`;
  
    const message = `New version of Next.js available: ${latestVersion}\nCheck it out on npm: ${npmLink}\nView the specific changelog: ${changelogLink}`;

    try {
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: SLACK_CHANNEL,
        text: message
      }, {
        headers: { Authorization: `Bearer ${SLACK_TOKEN}` }
      });
      console.log('Message sent to Slack:', message);
    } catch (error) {
      console.error('Error sending message to Slack:', error.response ? error.response.data : error.message);
      res.status(500).send('Error sending message to Slack');
    }
  };

  try {
    const latestVersionResponse = await axios.get(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`);
    const latestVersion = latestVersionResponse.data.version;

    const lastVersionKey = 'LAST_VERSION';
    let lastVersion = await kv.get(lastVersionKey);

    if (latestVersion !== lastVersion) {
      await sendMessageToSlack(latestVersion);
      await kv.set(lastVersionKey, latestVersion);
      res.send(`New version of Next.js found and notified: ${latestVersion}`);
    } else {
      res.send(`No new version. Current latest version is ${latestVersion}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
}
