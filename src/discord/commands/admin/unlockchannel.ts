import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ChannelType } from "discord.js";

new Command({
    name: "unlock",
    description: "Desbloqueia um canal para que os membros possam enviar mensagens",
    options: [
        {
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            description: "O canal a ser desbloqueado",
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const targetChannel = interaction.options.getChannel("channel", true);

        // Verifique se o canal é um canal de texto
        if (targetChannel.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: "Por favor, selecione um canal de texto.",
                ephemeral: true,
            });
        }

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);

        // Verifique se o bot tem a permissão de gerenciar canais
        if (!botMember.permissions.has("ManageChannels")) {
            return interaction.reply({
                content: "Eu não tenho permissão para gerenciar canais.",
                ephemeral: true,
            });
        }

        // Desbloquear o canal
        try {
            await targetChannel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: true,
                SendMessagesInThreads: true,
                AddReactions: true,
            });

            const embed = new EmbedBuilder()
                .setTitle("Canal Desbloqueado")
                .setDescription(`O canal <#${targetChannel.id}> foi desbloqueado.`)
                .setColor("#00ff00");

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao desbloquear o canal:", error);
            return interaction.reply({
                content: `Erro ao desbloquear o canal: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                ephemeral: true,
            });
        }
    },
});