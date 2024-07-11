import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "ban",
    description: "Bane um usuário do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuario",
            description: "O usuário a ser banido",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "motivo",
            description: "Razão para o banimento",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        // Extrai os dados necessários da interação
        const { options, member, guild } = interaction;
        const usuario = options.getUser("usuario", true);
        const motivo = options.getString("motivo") || "Nenhum motivo fornecido";

        // Cria uma instância do EmbedBuilder
        const embed = new EmbedBuilder();

        try {
            // Verifica se o usuário que executa o comando tem permissão de banir
            if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                embed
                    .setTitle("Erro")
                    .setDescription("Você não tem permissão para banir usuários.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;  // Garantindo que o comando retorne após o reply
            }

            // Verifica se o membro a ser banido está no servidor
            const targetMember = await guild.members.fetch(usuario.id);
            if (!targetMember) {
                embed
                    .setTitle("Erro")
                    .setDescription("Usuário não encontrado no servidor.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;  // Garantindo que o comando retorne após o reply
            }

            // Verifica se o bot tem permissão de banir usuários
            const botMember = guild.members.me;
            if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                embed
                    .setTitle("Erro")
                    .setDescription("Eu não tenho permissão para banir usuários.")
                    .setColor("Red");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;  // Garantindo que o comando retorne após o reply
            }

            // Realiza o banimento
            await targetMember.ban({ reason: motivo });

            embed
                .setTitle("Usuário Banido")
                .setDescription(`${usuario.tag} foi banido.`)
                .addFields(
                    { name: "Motivo", value: motivo, inline: true },
                    { name: "Usuário", value: `${usuario}`, inline: true },
                    { name: "Autor", value: `${member}`, inline: true },
                )
                .setColor("Green")
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });

        } catch (error) {
            console.error("Erro ao banir usuário:", error);

            embed
                .setTitle("Erro")
                .setDescription("Ocorreu um erro ao tentar banir o usuário. Tente novamente mais tarde.")
                .setColor("Red");

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
});