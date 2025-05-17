const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add points to a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("points").setDescription("Points to add").setRequired(true)
    ),

  async execute(interaction, Points) {
    const target = interaction.options.getUser("user");
    const pointsToAdd = interaction.options.getInteger("points");
    let userPoints = await Points.findOne({
      guildId: interaction.guildId,
      userId: target.id,
    });
    if (!userPoints) {
      userPoints = new Points({
        guildId: interaction.guildId,
        userId: target.id,
        points: 0,
      });
    }
    userPoints.points += pointsToAdd;
    await userPoints.save();

    await interaction.reply(
      `<@${userPoints.userId}> now has ${userPoints.points} points.`
    );
  },
};
