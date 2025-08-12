import dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import express from "express";
import { Webhooks } from "@octokit/webhooks";

const app = express();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Repository-channel mapping - fixed to use object access
const CHANNEL_MAP = {
  "ceu-dev/frontend": process.env.FRONTEND_CHANNEL_ID,
  "ceu-dev/backend": process.env.BACKEND_CHANNEL_ID,
};

const webhooks = new Webhooks({ secret: process.env.GITHUB_SECRET });

// Middleware to handle GitHub webhooks
app.use(express.json());
app.post("/github-webhook", (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const id = req.headers["x-github-delivery"];
    const event = req.headers["x-github-event"];

    webhooks
      .verifyAndReceive({
        id,
        name: event,
        signature,
        payload: JSON.stringify(req.body),
      })
      .then(() => res.status(200).send("OK"))
      .catch((error) => {
        console.error("Webhook verification error:", error);
        res.status(400).send("Invalid signature");
      });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Server error");
  }
});

webhooks.onAny(({ id, name, payload }) => {
  try {
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) return; // Safety check

    const channelId = CHANNEL_MAP[repoFullName];
    if (!channelId) return; // Ignore unmapped repos

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      console.error(`Channel not found for ${repoFullName}`);
      return;
    }

    // Create embed - might return null for unhandled events
    const embed = createEmbed(name, payload);
    if (embed) {
      channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// Formatted embed message
function createEmbed(event, payload) {
  try {
    const repo = payload.repository?.name || "Unknown Repo";
    const sender = payload.sender || {};
    const embed = new EmbedBuilder()
      .setColor(getColorForEvent(event))
      .setAuthor({
        name: sender.login || "Unknown User",
        iconURL: sender.avatar_url,
        url: sender.html_url,
      })
      .setTimestamp();

    switch (event) {
      case "push":
        const branch = payload.ref?.split("/").pop() || "unknown";
        const commits = (payload.commits || []).map(
          (c) =>
            `[\`${c.id.slice(0, 7)}\`](${c.url}) ${c.message.split("\n")[0]}`
        );

        embed
          .setTitle(`📥 Push to \`${branch}\` in ${repo}`)
          .setDescription(commits.join("\n") || "No commit description")
          .setURL(payload.compare);
        break;

      case "pull_request":
        const pr = payload.pull_request;
        if (!pr) return null;

        embed
          .setTitle(`🔀 Pull Request ${payload.action}: ${pr.title}`)
          .setDescription(
            pr.body?.substring(0, 200) || "No pull request description"
          )
          .addFields(
            {
              name: "Branch",
              value: `${pr.head?.ref || "unknown"} → ${
                pr.base?.ref || "unknown"
              }`,
              inline: true,
            },
            { name: "Status", value: pr.state || "unknown", inline: true }
          )
          .setURL(pr.html_url);
        break;

      case "issues":
        const issue = payload.issue;
        if (!issue) return null;

        embed
          .setTitle(`⚠️ Issue ${payload.action}: ${issue.title}`)
          .setDescription(
            issue.body?.substring(0, 200) || "No issue description"
          )
          .addFields(
            {
              name: "Labels",
              value: issue.labels?.map((l) => l.name).join(", ") || "None",
            },
            { name: "Assignee", value: issue.assignee?.login || "Unassigned" }
          )
          .setURL(issue.html_url);
        break;

      case "member":
        const member = payload.member;
        if (!member) return null;

        embed
          .setTitle(
            `👤 ${
              payload.action === "added"
                ? "New Collaborator"
                : "Removed Collaborator"
            }`
          )
          .setDescription(member.login || "Unknown user")
          .setURL(member.html_url);
        break;

      default:
        return null;
    }

    return embed;
  } catch (error) {
    console.error("Error creating embed:", error);
    return null;
  }
}

// Color coding for events
function getColorForEvent(event) {
  const colors = {
    push: 0x3498db, // Blue
    pull_request: 0x9b59b6, // Purple
    issues: 0xe74c3c, // Red
    member: 0x2ecc71, // Green
    default: 0xf1c40f, // Yellow
  };
  return colors[event] || colors.default;
}

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Discord bot logged in successfully!"))
  .catch(console.error);

app.listen(3000, () => console.log("DiscHub webhook server running"));
