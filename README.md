# Next.js Version Checker

This project contains a serverless function designed to check for new releases of Next.js. When a new version is detected, it sends a notification to a specified Slack channel.

## Features

- Checks the latest stable version of Next.js from the npm registry.
- Sends a notification to a Slack channel when a new version is detected.
- Utilises Vercel KV storage for persisting the last checked version.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your local development machine.
- A [Vercel](https://vercel.com/) account for deploying the serverless function.
- A [Slack](https://slack.com/) workspace and channel where notifications will be sent.

## Setup

### Configuring Environment Variables

Set up the following environment variables in your Vercel project:

- `SLACK_TOKEN`: Your Slack API token.
- `SLACK_CHANNEL`: The ID of your Slack channel where notifications will be sent.

Vercel will automatically set ENV vars for the storage authentication and url.

### Installing Dependencies

Run the following command to install the necessary dependencies:

```bash
yarn install
```

### Deploying to Vercel

Push the project to a Git repository and connect it to Vercel for deployment.

## Local Development

For local development, set up a `.env` file with the necessary environment variables and run the project using the Vercel CLI:

```bash
vercel dev
```

## Usage

Once deployed, the serverless function will be triggered via Vercel cron to check for new Next.js versions daily.

## Contributing

Contributions to this project are welcome. Please ensure that you update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
