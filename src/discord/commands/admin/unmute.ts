import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

new Command({
    name: "unmute",
    description: "Remove o silenciamento de um usuário",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "O usuário a ter o silenciamento removido",
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const targetUser = interaction.options.getUser("user", true);

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
                content: "Eu não tenho permissão para remover o silenciamento de membros.",
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

        // Remover o silenciamento do membro
        try {
            await targetMember.timeout(null); // Remove o timeout
            const embed = new EmbedBuilder()
                .setTitle("Usuário Não Silenciado")
                .setDescription(`${targetUser.username} teve o silenciamento removido.`)
                .setColor("#00ff00");

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao remover o silenciamento do usuário:", error);
            return interaction.reply({
                content: `Erro ao remover o silenciamento do usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                ephemeral: true,
            });
        }
    },
});