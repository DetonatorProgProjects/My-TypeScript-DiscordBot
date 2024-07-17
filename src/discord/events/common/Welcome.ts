import { Event } from "#base";
import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";

new Event({
    name: "WelcomeMessage",
    event: "guildMemberAdd",
    async run(member: GuildMember) {
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

        if (!welcomeChannelId) {
            console.error("A variável de ambiente WELCOME_CHANNEL_ID deve estar definida.");
            return;
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;

        if (welcomeChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 Bem-vindo(a) ao Servidor! 🎉')
                .setDescription(`Olá ${member.user.username}, seja bem-vindo(a) ao nosso servidor! Estamos felizes por você ter se juntado a nós.`)
                .addFields(
                    { name: '📜 Regras do Servidor:', value: 'Por favor, leia as [Regras](https://discord.com/channels/1259162688697925652/1259162689897369622) para garantir que todos tenhamos uma experiência agradável.' },
                    { name: '🔗 Links Úteis:', value: '[Canal de Anúncios](https://discord.com/channels/1259162688697925652/1259162689897369624) | [Canal de Suporte(https://discord.com/channels/1259162688697925652/1259162690249818290)' },
                    { name: '📢 O que fazer agora?', value: 'Personalize seu perfil no canal [Registro](https://discord.com/channels/1259162688697925652/1259162689897369623).\n📢 Participe das discussões e eventos em nossos canais ativos.\n❓ Se tiver dúvidas, não hesite em perguntar no [canal de suporte](link-para-suporte).' },
                    { name: '💡 Dicas Úteis:', value: 'Aqui estão algumas dicas para aproveitar ao máximo o nosso servidor:\n\n- **Personalize seu perfil:** Atualize sua foto de perfil e status para que os membros possam conhecê-lo(a) melhor.\n- **Fique atento(a) aos anúncios:** Verifique regularmente o canal de anúncios para não perder nenhuma atualização importante.\n- **Interaja com outros membros:** Participe das discussões e faça amigos. Quanto mais você interagir, mais divertido será!' },
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Estamos aqui para ajudar!', iconURL: member.guild.iconURL() || '' });

            try {
                await welcomeChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Não foi possível enviar a mensagem de boas-vindas para ${member.user.tag}:`, error);
            }
        } else {
            console.warn(`Canal com ID "${welcomeChannelId}" não encontrado ou não é um canal de texto.`);
        }
    }
});