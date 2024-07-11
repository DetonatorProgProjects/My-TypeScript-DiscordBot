import { Event } from "#base";
import { EmbedBuilder } from "discord.js";
import { config } from "settings/config.js";

new Event({
    name: "User Leave",
    event: "guildMemberRemove",
    async run(member) {
        const channel = member.guild.channels.cache.get(config.goodbyeChannelId);
        if (!channel || !channel.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle("👋 Membro Saiu")
            .setDescription(`${member.displayName} saiu do servidor. Sentiremos sua falta!`)
            .setColor("Red")
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
});