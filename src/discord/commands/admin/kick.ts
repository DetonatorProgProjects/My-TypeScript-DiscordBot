import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "kick",
    description: "Expulsa um usuário do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuario",
            description: "O usuário a ser expulso",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "Motivo para a expulsão",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const { options, member, guild } = interaction;
        const usuario = options.getUser("usuario", true);
        const motivo = options.getString("motivo") || "Nenhum motivo fornecido";

        const embed = new EmbedBuilder();

        try {
            // Verifica se o usuário que executa o comando tem permissão para expulsar membros
            if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                embed
                    .setTitle("Erro")
                    .setDescription("Você não tem permissão para expulsar membros.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Verifica se o membro a ser expulso está no servidor
            const targetMember = await guild.members.fetch(usuario.id);
            if (!targetMember) {
                embed
                    .setTitle("Erro")
                    .setDescription("Usuário não encontrado no servidor.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Verifica se o bot tem permissão para expulsar membros
            const botMember = guild.members.me;
            if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                embed
                    .setTitle("Erro")
                    .setDescription("Eu não tenho permissão para expulsar membros.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Expulsa o membro do servidor
            await targetMember.kick(motivo);

            embed
                .setTitle("Usuário Expulso")
                .setDescription(`${usuario.tag} foi expulso do servidor.`)
                .addFields(
                    { name: "Motivo", value: motivo, inline: true },
                    { name: "Usuário", value: `${usuario}`, inline: true },
                    { name: "Autor", value: `${member}`, inline: true },
                )
                .setColor("Green")
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });

        } catch (error) {
            console.error("Erro ao expulsar usuário:", error);

            embed
                .setTitle("Erro")
                .setDescription("Ocorreu um erro ao tentar expulsar o usuário. Tente novamente mais tarde.")
                .setColor("Red");

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
});