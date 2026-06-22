const { EmbedBuilder } = require('@discordjs/builders');
const welcomeGifs = require('../gifarray.json');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Fetch the welcome channel dynamically
      const welcomeChannel = member.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase().includes('welcome') && channel.isTextBased()
      );

      if (!welcomeChannel) {
        console.error(`Welcome channel not found in guild: ${member.guild.name} (${member.guild.id})`);
        return;
      }
      const randomGif = welcomeGifs[Math.floor(Math.random() * welcomeGifs.length)];

      const embed = new EmbedBuilder()
        .setTitle(`Welcome to ${member.guild.name}, ${member.user.tag}!`)
        .setDescription('On behalf of the staff and members, we hope you have a great stay!')
        .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() }) // Use server name and icon
        .setImage(randomGif)
        .setColor(0x00FF00) // Set a color for the embed
        .setThumbnail(member.user.displayAvatarURL()); // Add the user's avatar as a thumbnail

      await welcomeChannel.send({ embeds: [embed] });
      console.log(`Welcome message sent to ${member.user.tag} in ${member.guild.name}.`);
    } catch (error) {
      console.error(`Error sending welcome message in guild ${member.guild.id}:`, error);
    }
  });
};
