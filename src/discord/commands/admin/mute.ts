import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";


new Command({
    name: "mute",
    description: "Silenciar um membro do servidor",
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
            description: "O motivo do silenciamento",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "duração",
            description: "A duração do mute (em minutos)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
    async run(interaction) {
        const { options, member } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            await interaction.reply({
                content: "Você não tem permissão para silenciar membros!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo") || "Sem motivo especificado";
        const duration = options.getInteger("duração");

        // Converte minutos para milissegundos
        const muteDuration = duration ? duration * 60 * 1000 : null;

        try {
            // Verifica se o membro é um bot ou se não há permissões
            const memberToMute = await interaction.guild.members.fetch(user.id);
            if (memberToMute.roles.highest.position >= member.roles.highest.position) {
                await interaction.reply({
                    content: "Não é possível silenciar um membro com um papel mais alto ou igual ao seu.",
                    ephemeral: true,
                });
                return;
            }

            // Adiciona um timeout ao membro
            await memberToMute.timeout(muteDuration, reason);

            // Cria uma mensagem de resposta com o motivo e a duração do mute
            const embed = new EmbedBuilder()
                .setTitle("Usuário Silenciado")
                .setDescription(`**${user.tag}** foi silenciado.`)
                .addFields(
                    { name: "Motivo", value: reason },
                    { name: "Duração", value: duration ? `${duration} minutos` : "Indefinida" }
                )
                .setColor("Yellow")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Envia um log para o canal de logs
            const logChannelId = process.env.LOG_CHANNEL_ID;
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel && logChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("Log de Silenciamento")
                    .addFields(
                        { name: "Usuário", value: `${user.tag}` },
                        { name: "Silenciado por", value: `${member.user.tag}` },
                        { name: "Motivo", value: reason },
                        { name: "Duração", value: duration ? `${duration} minutos` : "Indefinida" }
                    )
                    .setColor("Orange")
                    .setTimestamp();
                
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.warn("Log channel is not defined or not text-based.");
            }

            // Se a duração for definida, cria um embed para avisar quando o timeout acabar
            if (muteDuration) {
                setTimeout(async () => {
                    // Remove o timeout após a duração especificada
                    await memberToMute.timeout(null);

                    const unmuteEmbed = new EmbedBuilder()
                        .setTitle("Silenciamento Encerrado")
                        .setDescription(`**${user.tag}** não está mais silenciado.`)
                        .setColor("Green")
                        .setTimestamp();

                    await interaction.followUp({ embeds: [unmuteEmbed] });

                    // Log do fim do silenciamento
                    if (logChannel && logChannel.isTextBased()) {
                        const unmuteLogEmbed = new EmbedBuilder()
                            .setTitle("Log de Fim de Silenciamento")
                            .addFields(
                                { name: "Usuário", value: `${user.tag}` },
                                { name: "Silenciado por", value: `${member.user.tag}` },
                                { name: "Motivo", value: reason }
                            )
                            .setColor("Green")
                            .setTimestamp();

                        await logChannel.send({ embeds: [unmuteLogEmbed] });
                    }
                }, muteDuration);
            }
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Silenciar")
                .setDescription(`Falha ao silenciar **${user.tag}**.`)
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});