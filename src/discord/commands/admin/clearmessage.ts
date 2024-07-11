import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } from "discord.js";

new Command({
    name: "clear",
    description: "Limpa uma quantidade específica de mensagens do chat",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "quantidade",
            description: "Número de mensagens a serem deletadas",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    async run(interaction) {
        const { options, channel, member } = interaction;
        const quantidade = options.getInteger("quantidade", true);

        // Verifica se o usuário tem a permissão adequada
        if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            interaction.reply({ ephemeral, content: "Você não tem permissão para limpar mensagens." });
            return;
        }

        // Verifica se o canal é válido e um canal de texto
        if (!channel || !channel.isTextBased()) {
            interaction.reply({ ephemeral, content: "Este comando só pode ser usado em canais de texto." });
            return;
        }

        // Limita a quantidade de mensagens a serem deletadas entre 1 e 100
        const quantidadeValida = Math.min(Math.max(quantidade, 1), 100);

        try {
            const mensagens = await channel.bulkDelete(quantidadeValida, true);
            interaction.reply({ content: `Foram deletadas ${mensagens.size} mensagens.` });
        } catch (error) {
            console.error("Erro ao deletar mensagens:", error);
            interaction.reply({ ephemeral,  content: "Ocorreu um erro ao tentar deletar as mensagens. Tente novamente mais tarde." });
        }
    },
});