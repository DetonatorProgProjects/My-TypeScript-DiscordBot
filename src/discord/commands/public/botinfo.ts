import { Command } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import os from "os";

function formatUptime(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

new Command({
    name: "botinfo",
    description: "Display information about the bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const { client } = interaction;
        const botUser = client.user;

        if (!botUser) {
            interaction.reply({ ephemeral, content: "Unable to retrieve bot information." });
            return;
        }

        const uptime = formatUptime(client.uptime ?? 0);
        const servers = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle("Bot Information")
            .setThumbnail(botUser.displayAvatarURL())
            .addFields(
                { name: "Bot Name", value: botUser.username, inline: true },
                { name: "Bot Tag", value: `#${botUser.discriminator}`, inline: true },
                { name: "ID", value: botUser.id, inline: true },
                { name: "Uptime", value: uptime, inline: true },
                { name: "Servers", value: servers.toString(), inline: true },
                { name: "Users", value: users.toString(), inline: true },
                { name: "Memory Usage", value: `${memoryUsage} MB`, inline: true },
                { name: "Node.js Version", value: process.version, inline: true },
                { name: "Operating System", value: os.type(), inline: true }
            )
            .setColor("Blue");

        interaction.reply({ embeds: [embed] });
    },
});