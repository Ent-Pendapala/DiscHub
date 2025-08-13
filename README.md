# DiscHub

DiscHub is a Discord bot that listens to GitHub Webhooks and posts repository updates (pushes, pull requests, issues, and collaborators) into specific Discord channels.  
It supports **multiple repositories** and can route events to different channels depending on the repo.

---

## Features
- Sends GitHub repo updates directly to Discord channels.
- Supports multiple repos → multiple channels.
- Uses Discord embeds for clean, readable messages.
- Works with GitHub organisations and personal repos.
- Deployed on Render.

---

## Tech Stack
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [discord.js](https://discord.js.org/)

---

## Setup

### 1. Clone the repository

```bash

git clone https://github.com/Ent-Pendapala/DiscHub.git
cd DiscHub

```

### 2. Install dependencies

```
npm install

```
### 3. Create a .env file in the root directory

Fill it with the following contents:

```
DISCORD_TOKEN=your_discord_bot_token
FRONTEND_CHANNEL_ID=frontend_channel_id
BACKEND_CHANNEL_ID=backend_channel_id
PORT=3000
```
Make sure .env file is added to .gitignore file.



## Usage

### Running Locally

#### Start the bot:

```
npm start
```

Use a tool like ngrok to expose your local port if you want to test webhooks without deployment:

```
ngrok http 3000
```

Set the Payload URL in your GitHub webhook settings to the ngrok URL plus /github-webhook.


#### GitHub Webhook Setup

Go to your repository or organisation settings → Webhooks → Add webhook.

Payload URL:  
> https://your-domain-or-ngrok-url/github-webhook

Content type:  
>application/json

Events:  
>Select Push, Pull Request, Issues, Member (or "Send me everything").

Save.  



### Deploying on Render (However, okay with other deployment sites)


Push your code to GitHub.  
Create a new Web Service on Render and connect your repo.

Build command:
```
npm install
```

Start command:
```
npm start
```
Add the environment variables from your .env file in the Environment tab on Render.  
Deploy — Render will give you a public URL.  
Use that URL for your GitHub webhook payload.

## Contributing
Feel free to fork the repo and submit PRs for new features, bug fixes, or event support.

## License
AGPL-3.0 [License](https://www.gnu.org/licenses/agpl-3.0.txt). See LICENSE for details.

In short: You can use, modify, and share this project,  
but if you run a modified version (even on a private server),  
you must also share your changes under the same license.
