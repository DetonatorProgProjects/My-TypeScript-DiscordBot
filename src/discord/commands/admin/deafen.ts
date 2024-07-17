import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "deafen",
    description: "Silencia um membro em um canal de voz",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser silenciado",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "Motivo para o silenciamento",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const { options, member, guild } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para silenciar membros em canais de voz!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo") || "Nenhum motivo fornecido.";

        try {
            const memberToDeafen = await guild.members.fetch(user.id);

            // Verifica se o membro está em um canal de voz
            if (!memberToDeafen.voice.channel) {
                await interaction.reply({
                    content: "O membro não está em um canal de voz.",
                    ephemeral: true,
                });
                return;
            }

            // Silencia o membro no canal de voz
            await memberToDeafen.voice.setDeaf(true, reason);

            // Cria uma mensagem de confirmação
            const embed = new EmbedBuilder()
                .setTitle("Membro Silenciado")
                .setDescription(`O membro **${user.tag}** foi silenciado no canal de voz.`)
                .addFields(
                    { name: "Motivo", value: reason },
                    { name: "Canal de Voz", value: memberToDeafen.voice.channel.name }
                )
                .setColor("Blue")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia uma mensagem para o membro sobre o deafen
            await memberToDeafen.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Você Foi Silenciado")
                        .setDescription(`Você foi silenciado no canal de voz **${memberToDeafen.voice.channel.name}** no servidor **${guild.name}**.`)
                        .addFields(
                            { name: "Motivo", value: reason },
                            { name: "Servidor", value: guild.name },
                        )
                        .setColor("Blue")
                        .setTimestamp(),
                ],
            });

            // Registro de silenciamento em um canal de logs, se houver
            const logChannelId = process.env.LOG_CHANNEL_ID; // Defina o ID do canal de logs no arquivo .env
            if (logChannelId) {
                const logChannel = await guild.channels.fetch(logChannelId);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Membro Silenciado")
                                .setDescription(`**${user.tag}** foi silenciado no canal de voz.`)
                                .addFields(
                                    { name: "Motivo", value: reason },
                                    { name: "Canal de Voz", value: memberToDeafen.voice.channel.name },
                                    { name: "Moderador", value: member.user.tag }
                                )
                                .setColor("Blue")
                                .setTimestamp(),
                        ],
                    });
                }
            }

        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Silenciar")
                .setDescription(`Não foi possível silenciar **${user.tag}**.`)
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});