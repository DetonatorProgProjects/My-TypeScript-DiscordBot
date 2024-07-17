import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "undeafen",
    description: "Remove o silenciamento de um membro em um canal de voz",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser des-silenciado",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    async run(interaction) {
        const { options, member, guild } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para des-silenciar membros em canais de voz!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);

        try {
            const memberToUndeafen = await guild.members.fetch(user.id);

            // Verifica se o membro está em um canal de voz e está silenciado
            if (!memberToUndeafen.voice.channel) {
                await interaction.reply({
                    content: "O membro não está em um canal de voz.",
                    ephemeral: true,
                });
                return;
            }

            if (!memberToUndeafen.voice.serverDeaf) {
                await interaction.reply({
                    content: "O membro não está silenciado.",
                    ephemeral: true,
                });
                return;
            }

            // Remove o silenciamento do membro no canal de voz
            await memberToUndeafen.voice.setDeaf(false);

            // Cria uma mensagem de confirmação
            const embed = new EmbedBuilder()
                .setTitle("Membro Des-Silenciado")
                .setDescription(`O membro **${user.tag}** foi des-silenciado no canal de voz.`)
                .addFields(
                    { name: "Canal de Voz", value: memberToUndeafen.voice.channel.name }
                )
                .setColor("Green")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia uma mensagem para o membro sobre o undeafen
            await memberToUndeafen.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Você Foi Des-Silenciado")
                        .setDescription(`Você foi des-silenciado no canal de voz **${memberToUndeafen.voice.channel.name}** no servidor **${guild.name}**.`)
                        .addFields(
                            { name: "Servidor", value: guild.name },
                        )
                        .setColor("Green")
                        .setTimestamp(),
                ],
            });

            // Registro do des-silenciamento em um canal de logs, se houver
            const logChannelId = process.env.LOG_CHANNEL_ID; // Defina o ID do canal de logs no arquivo .env
            if (logChannelId) {
                const logChannel = await guild.channels.fetch(logChannelId);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Membro Des-Silenciado")
                                .setDescription(`**${user.tag}** foi des-silenciado no canal de voz.`)
                                .addFields(
                                    { name: "Canal de Voz", value: memberToUndeafen.voice.channel.name },
                                    { name: "Moderador", value: member.user.tag }
                                )
                                .setColor("Green")
                                .setTimestamp(),
                        ],
                    });
                }
            }

        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Des-Silenciar")
                .setDescription(`Não foi possível des-silenciar **${user.tag}**.`)
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});