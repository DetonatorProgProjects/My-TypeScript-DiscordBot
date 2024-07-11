
import { Event } from "#base";
import { EmbedBuilder } from "discord.js";
import { config } from "settings/config.js";


new Event({
    name: "User Join",
    event: "guildMemberAdd",
    async run(member) {
        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (!channel || !channel.isTextBased()) return;

        const rolesToAdd = member.user.bot ? config.botRoleIds : config.memberRoleIds;
        
        for (const roleId of rolesToAdd) {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                try {
                    await member.roles.add(role);
                } catch (error) {
                    console.error(`Erro ao adicionar o cargo ${role.name}: ${error}`);
                }
            } else {
                console.error(`Cargo com ID ${roleId} não encontrado`);
            }
        }

        const joinedAt = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "Data desconhecida";
        const guildIconURL = member.guild.iconURL() || '';

        const embed = new EmbedBuilder()
            .setTitle("🎉 Bem-vindo ao Servidor! 🎉")
            .setDescription(`Olá ${member}, bem-vindo ao **${member.guild.name}**! Estamos muito felizes em ter você aqui.`)
            .addFields(
                { name: "👤 Nome de Usuário", value: member.user.tag, inline: true },
                { name: "📅 Entrou em", value: joinedAt, inline: true },
                { name: "🔗 Links Úteis", value: "[Regras do Servidor](https://discord.com/channels/1259162688697925652/1259162689897369622) | [Canal de Anúncios](https://discord.com/channels/1259162688697925652/1259162689897369624)" },
                { name: "💬 Canais Principais", value: "#general | #ajuda | #suporte", inline: false }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setColor("Green")
            .setFooter({ text: "Aproveite sua estadia!", iconURL: guildIconURL })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
});