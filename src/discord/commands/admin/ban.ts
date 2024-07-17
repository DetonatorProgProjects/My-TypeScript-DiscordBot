import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "ban",
    description: "Banir um membro do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser banido",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "O motivo do banimento",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const { options, member } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para banir membros!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo") || "Sem motivo especificado";

        try {
            // Verifica se o membro é um bot ou se não há permissões
            const memberToBan = await interaction.guild.members.fetch(user.id);
            if (memberToBan.roles.highest.position >= member.roles.highest.position) {
                await interaction.reply({
                    content: "Não é possível banir um membro com um papel mais alto ou igual ao seu.",
                    ephemeral: true,
                });
                return;
            }

            // Bane o membro
            await memberToBan.ban({ reason });

            // Cria uma mensagem de resposta com o motivo do ban
            const embed = new EmbedBuilder()
                .setTitle("Usuário Banido")
                .setDescription(`**${user.tag}** foi banido.`)
                .addFields(
                    { name: "Motivo", value: reason }
                )
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia um log para o canal de logs
            const logChannelId = process.env.LOG_CHANNEL_ID;
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel && logChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("Log de Banimento")
                    .addFields(
                        { name: "Usuário", value: `${user.tag}` },
                        { name: "Banido por", value: `${member.user.tag}` },
                        { name: "Motivo", value: reason }
                    )
                    .setColor("DarkRed")
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.warn("Log channel is not defined or not text-based.");
            }
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Banir")
                .setDescription(`Falha ao banir **${user.tag}**.`)
                .setColor("DarkRed")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});