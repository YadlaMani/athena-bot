const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("display")
    .setDescription("Display all user points"),

  async execute(interaction, Points) {
    const allPoints = await Points.find({ guildId: interaction.guildId });

    if (!allPoints.length) {
      return interaction.reply("No points have been assigned yet.");
    }

    const msg = allPoints
      .map((p) => `<@${p.userId}>: ${p.points} points`)
      .join("\n");

    await interaction.reply(msg);
  },
};
