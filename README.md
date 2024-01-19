# NPM Package Version Checker

This project contains a serverless function for monitoring new releases of various NPM packages, including Next.js and Partytown. It sends notifications to a specified Slack channel when updates are detected.

## Features

- Monitors multiple NPM packages for new versions.
- Sends Slack notifications for each package update.
- Utilises Vercel KV storage to track the last checked version of each package.

## Prerequisites

- Node.js installation.
- A Vercel account for deploying serverless functions.
- A Slack workspace and channel for receiving notifications.

## Setup

### Configuring Environment Variables

Required environment variables in your Vercel project:

- `SLACK_TOKEN`: Slack API token.
- `SLACK_CHANNEL`: ID of the Slack channel for notifications.

### Installing Dependencies

Install dependencies using:

```bash
yarn install
```

### Deploying to Vercel

Connect the project to a Git repository and link it to Vercel for deployment.

## Local Development

Use a `.env` file for environment variables and the Vercel CLI for local development:

```bash
vercel dev
```

## Usage

The function, once deployed, checks for package updates daily via Vercel cron jobs.

## Contributing

Contributions are welcome, especially in expanding package monitoring. Please update tests accordingly.

## License

[MIT](https://choosealicense.com/licenses/mit/)
