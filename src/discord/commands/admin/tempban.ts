import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from "discord.js";

new Command({
    name: "tempban",
    description: "Bane um usuário por um determinado tempo",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "O usuário a ser banido",
            required: true,
        },
        {
            name: "duration",
            type: ApplicationCommandOptionType.Integer,
            description: "Duração do banimento em minutos",
            required: true,
        },
        {
            name: "reason",
            type: ApplicationCommandOptionType.String,
            description: "Razão para o banimento",
            required: false,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const targetUser = interaction.options.getUser("user", true);
        const duration = interaction.options.getInteger("duration", true);
        const reason = interaction.options.getString("reason") || "Não especificado";

        // Verifica se a duração é válida
        if (duration <= 0) {
            return interaction.reply({
                content: "A duração deve ser um número positivo.",
                ephemeral: true,
            });
        }

        // Verifique se o bot tem a permissão de banir membros
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({
                content: "Eu não tenho permissão para banir membros.",
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

        // Verifique se o bot tem a permissão de banir o membro alvo
        if (!targetMember.bannable) {
            return interaction.reply({
                content: "Não posso banir esse usuário. Verifique minhas permissões ou o papel do usuário.",
                ephemeral: true,
            });
        }

        // Banir o membro
        try {
            await targetMember.ban({ reason });

            // Enviar um embed de sucesso
            const embed = new EmbedBuilder()
                .setTitle("Usuário Banido")
                .setDescription(`${targetUser.username} foi banido por ${duration} minuto(s).`)
                .addFields([{ name: "Razão", value: reason }])
                .setColor("#ff0000");

            await interaction.reply({ embeds: [embed] });

            // Agendar a remoção do banimento após o período de duração
            setTimeout(async () => {
                try {
                    await interaction.guild.bans.remove(targetUser.id);
                    console.log(`Usuário ${targetUser.username} desbanido após ${duration} minutos.`);
                } catch (error) {
                    console.error("Erro ao desbanir o usuário:", error);
                }
            }, duration * 60 * 1000); // Duração em milissegundos

        } catch (error) {
            console.error("Erro ao banir o usuário:", error);
            await interaction.reply({
                content: `Erro ao banir o usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                ephemeral: true,
            });
        }

        // Adiciona um retorno de sucesso, mesmo que vazio
        return undefined; // Adiciona esta linha para satisfazer o TypeScript
    },
});