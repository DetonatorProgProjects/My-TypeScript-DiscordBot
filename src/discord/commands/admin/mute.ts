import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

new Command({
    name: "mute",
    description: "Silencia um usuário por um determinado tempo",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "O usuário a ser silenciado",
            required: true,
        },
        {
            name: "duration",
            type: ApplicationCommandOptionType.Integer,
            description: "Duração do silêncio em minutos",
            required: true,
        },
        {
            name: "reason",
            type: ApplicationCommandOptionType.String,
            description: "Razão para o silêncio",
            required: false,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const targetUser = interaction.options.getUser("user", true);
        const duration = interaction.options.getInteger("duration", true);
        const reason = interaction.options.getString("reason") || "Não especificado";

        const clientUser = interaction.client.user;

        if (!clientUser) {
            return interaction.reply({
                content: "Erro ao obter informações do bot.",
                ephemeral: true,
            });
        }

        // Verifique se o bot tem a permissão de moderar membros
        const botMember = await interaction.guild.members.fetch(clientUser.id);
        if (!botMember.permissions.has("ModerateMembers")) {
            return interaction.reply({
                content: "Eu não tenho permissão para silenciar membros.",
                ephemeral: true,
            });
        }

        // Verifique se o membro é válido
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        if (!targetMember) {
            return interaction.reply({
                content: "Usuário não encontrado no servidor.",
                ephemeral: true,
            });
        }

        // Silenciar o membro
        try {
            await targetMember.timeout(duration * 60 * 1000, reason); // Duração em milissegundos
            const embed = new EmbedBuilder()
                .setTitle("Usuário Silenciado")
                .setDescription(`${targetUser.username} foi silenciado por ${duration} minutos.`)
                .addFields([{ name: "Razão", value: reason }])
                .setColor("#ff0000");

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao silenciar o usuário:", error);
            return interaction.reply({
                content: `Erro ao silenciar o usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                ephemeral: true,
            });
        }
    },
});