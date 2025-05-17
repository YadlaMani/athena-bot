const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  MessageFlags,
} = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const Points = require("./model/points");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const points = {};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
const commands = [];
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  const isOwner = interaction.user.id === process.env.OWNER_ID;
  const isTargetChannel = interaction.channelId === process.env.CHANNEL_ID;

  if (["add", "remove"].includes(interaction.commandName)) {
    if (!isOwner) {
      return interaction.reply({
        content: "Only the server owner can use this command.",
        ephemeral: true,
      });
    }

    if (!isTargetChannel) {
      return interaction.reply({
        content: "This command can only be used in the specified channel.",
        ephemeral: true,
      });
    }
  }

  try {
    await command.execute(interaction, Points);
  } catch (err) {
    console.log(err);
    const errorMsg = {
      content: "There was an error while executing this command!",
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg);
    } else {
      await interaction.reply(errorMsg);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
