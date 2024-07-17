import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "warn",
    description: "Dá um aviso a um membro por violar as regras do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "O usuário a ser advertido",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "O motivo do aviso",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async run(interaction) {
        const { options, member, guild } = interaction;

        // Verifica se o usuário que está executando o comando tem permissões
        if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({
                content: "Você não tem permissão para dar avisos!",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("usuário", true);
        const reason = options.getString("motivo", true);

        try {
            const memberToWarn = await guild.members.fetch(user.id);

            // Verifica se o membro é um bot ou se não há permissões
            if (memberToWarn.roles.highest.position >= member.roles.highest.position) {
                await interaction.reply({
                    content: "Não é possível advertir um membro com um papel mais alto ou igual ao seu.",
                    ephemeral: true,
                });
                return;
            }

            // Cria uma mensagem de aviso para o membro
            await memberToWarn.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Você Recebeu um Aviso")
                        .setDescription(`Você foi advertido no servidor **${guild.name}**`)
                        .addFields(
                            { name: "Motivo", value: reason },
                            { name: "Servidor", value: guild.name },
                        )
                        .setColor("Yellow")
                        .setTimestamp(),
                ],
            });

            // Envia uma mensagem de confirmação no canal
            const embed = new EmbedBuilder()
                .setTitle("Aviso Dado")
                .setDescription(`O membro **${user.tag}** recebeu um aviso.`)
                .addFields(
                    { name: "Motivo", value: reason },
                )
                .setColor("Yellow")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Registro de aviso em um canal de logs, se houver
            const logChannelId = process.env.LOG_CHANNEL_ID; // Defina o ID do canal de logs no arquivo .env
            if (logChannelId) {
                const logChannel = await guild.channels.fetch(logChannelId);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Novo Aviso")
                                .setDescription(`**${user.tag}** recebeu um aviso.`)
                                .addFields(
                                    { name: "Motivo", value: reason },
                                    { name: "Moderador", value: member.user.tag },
                                )
                                .setColor("Yellow")
                                .setTimestamp(),
                        ],
                    });
                }
            }

        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("Erro ao Dar Aviso")
                .setDescription(`Falha ao dar um aviso a **${user.tag}**.`)
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
});
