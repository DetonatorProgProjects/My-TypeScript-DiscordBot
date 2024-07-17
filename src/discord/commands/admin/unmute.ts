import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "unmute",
    description: "Remover o silêncio de um membro do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser desmutado",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "O motivo do desmutamento",
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    async run(interaction) {
        const { options, member } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para desmutar membros!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo") || "Sem motivo especificado";

        try {
            // Verifica se o membro é um bot ou se não há permissões
            const memberToUnmute = await interaction.guild.members.fetch(user.id);
            if (memberToUnmute.roles.highest.position >= member.roles.highest.position) {
                await interaction.reply({
                    content: "Não é possível desmutar um membro com um papel mais alto ou igual ao seu.",
                    ephemeral: true,
                });
                return;
            }

            // Remove o timeout do membro
            await memberToUnmute.timeout(null);

            // Cria uma mensagem de resposta com o motivo do unmute
            const embed = new EmbedBuilder()
                .setTitle("Usuário Desmutado")
                .setDescription(`**${user.tag}** foi desmutado.`)
                .addFields(
                    { name: "Motivo", value: reason }
                )
                .setColor("Green")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia um log para o canal de logs
            const logChannelId = process.env.LOG_CHANNEL_ID;
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel && logChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("Log de Desmutamento")
                    .addFields(
                        { name: "Usuário", value: `${user.tag}` },
                        { name: "Desmutado por", value: `${member.user.tag}` },
                        { name: "Motivo", value: reason }
                    )
                    .setColor("Blue")
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.warn("Log channel is not defined or not text-based.");
            }
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Desmutar")
                .setDescription(`Falha ao desmutar **${user.tag}**.`)
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});