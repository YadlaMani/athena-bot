const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove points from a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("points").setDescription("Points to remove").setRequired(true)
    ),

  async execute(interaction, Points) {
    const target = interaction.options.getUser("user");
    const pointsToRemove = interaction.options.getInteger("points");
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
    userPoints.points = userPoints.points - pointsToRemove;
    await userPoints.save();

    await interaction.reply(
      `<@${userPoints.userId}> now has ${userPoints.points} points.`
    );
  },
};
