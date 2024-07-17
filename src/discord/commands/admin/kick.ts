import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "kick",
    description: "Expulsar um membro do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser expulso",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "O motivo da expulsão",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const { options, member } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para expulsar membros!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo") || "Sem motivo especificado";

        try {
            // Verifica se o membro é um bot ou se não há permissões
            const memberToKick = await interaction.guild.members.fetch(user.id);
            if (memberToKick.roles.highest.position >= member.roles.highest.position) {
                await interaction.reply({
                    content: "Não é possível expulsar um membro com um papel mais alto ou igual ao seu.",
                    ephemeral: true,
                });
                return;
            }

            // Expulsa o membro
            await memberToKick.kick(reason);

            // Cria uma mensagem de resposta com o motivo da expulsão
            const embed = new EmbedBuilder()
                .setTitle("Usuário Expulso")
                .setDescription(`**${user.tag}** foi expulso.`)
                .addFields(
                    { name: "Motivo", value: reason }
                )
                .setColor("Orange")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia um log para o canal de logs
            const logChannelId = process.env.LOG_CHANNEL_ID;
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel && logChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("Log de Expulsão")
                    .addFields(
                        { name: "Usuário", value: `${user.tag}` },
                        { name: "Expulso por", value: `${member.user.tag}` },
                        { name: "Motivo", value: reason }
                    )
                    .setColor("DarkOrange")
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.warn("Log channel is not defined or not text-based.");
            }
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Expulsar")
                .setDescription(`Falha ao expulsar **${user.tag}**.`)
                .setColor("DarkOrange")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});