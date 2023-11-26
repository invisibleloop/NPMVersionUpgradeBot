const axios = require('axios');

module.exports = async (req, res) => {
  require('dotenv').config();
  const PACKAGE_NAME = 'next';
  const SLACK_TOKEN = process.env.SLACK_TOKEN;
  const SLACK_CHANNEL = process.env.SLACK_CHANNEL;
  const lastVersion = process.env.LAST_VERSION || '0.0.0';

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
    const response = await axios.get(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`);
    const latestVersion = response.data.version;

    if (latestVersion !== lastVersion) {
      await sendMessageToSlack(latestVersion);
      // Here you would ideally update the LAST_VERSION environment variable
      // or store this information in a database
      res.send(`New version of Next.js found and notified: ${latestVersion}`);
    } else {
      res.send(`No new version. Current latest version is ${latestVersion}`);
    }
  } catch (error) {
    console.error('Error checking Next.js version:', error.message);
    res.status(500).send('Error checking Next.js version');
  }
};
