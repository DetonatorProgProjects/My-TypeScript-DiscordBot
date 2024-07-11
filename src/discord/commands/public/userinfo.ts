import { Command } from "#base";
import { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";

new Command({
    name: "userinfo",
    description: "Display information about a user",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "The user to get information about",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    async run(interaction) {
        const user = interaction.options.getUser("user", true);
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Information`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: "Username", value: user.username, inline: true },
                { name: "Discriminator", value: `#${user.discriminator}`, inline: true },
                { name: "ID", value: user.id, inline: true },
                { name: "Account Created", value: user.createdAt.toDateString(), inline: true },
            )
      .setColor("DarkButNotBlack")

        if (member) {
            embed.addFields(
                { name: "Joined Server", value: member.joinedAt ? member.joinedAt.toDateString() : "Unknown", inline: true },
                { name: "Roles", value: member.roles.cache.map(role => role.name).join(', '), inline: true }
            );
        } else {
            embed.addFields(
                { name: "Joined Server", value: "User not in server", inline: true }
            );
        }

        interaction.reply({ embeds: [embed] });
    },
});