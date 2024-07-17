import { Event } from "#base";
import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";

new Event({
    name: "AutoRole",
    event: "guildMemberAdd",
    async run(member: GuildMember) {
        // Obtendo o ID do papel e o ID do canal de logs a partir das variáveis de ambiente
        const roleId = process.env.AUTO_ROLE_NAME;
        const logChannelId = process.env.LOG_CHANNEL_ID;

        // Verifica se as variáveis de ambiente estão definidas
        if (!roleId || !logChannelId) {
            console.error("As variáveis de ambiente AUTO_ROLE_ID e LOG_CHANNEL_ID devem estar definidas.");
            return;
        }

        // Encontre o papel pelo ID
        const role = member.guild.roles.cache.get(roleId);
        const logChannel = member.guild.channels.cache.get(logChannelId) as TextChannel;

        if (role) {
            try {
                await member.roles.add(role);

                // Criação do embed
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')  // Verde para sucesso
                    .setTitle('Novo Membro Atribuído com Papel')
                    .setDescription(`O papel **${role.name}** foi adicionado a ${member.user.tag}.`)
                    .addFields(
                        { name: 'Membro', value: `${member.user.tag}`, inline: true },
                        { name: 'ID do Membro', value: `${member.id}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Sistema de AutoRole', iconURL: member.guild.iconURL() || '' });

                // Envia a mensagem para o canal de logs
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                } else {
                    console.warn(`Canal com ID "${logChannelId}" não encontrado ou não é um canal de texto.`);
                }

            } catch (error) {
                console.error(`Não foi possível adicionar o papel "${role.name}" a ${member.user.tag}:`, error);
            }
        } else {
            console.warn(`Papel com ID "${roleId}" não encontrado no servidor.`);
        }
    }
});