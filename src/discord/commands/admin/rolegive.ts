// Command setup-role
import { Command, Responder, ResponderType } from "#base";
import { icon } from "#functions";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, Role, User, ButtonBuilder, ButtonStyle, ButtonInteraction, GuildMember } from "discord.js";

new Command({
    name: "setup-role",
    description: "Configura um botão para adicionar ou remover um cargo de um membro",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Membro do servidor",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "role",
            description: "Cargo a ser adicionado ou removido",
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
    async run(interaction) {
        const { options, guild } = interaction;
        if (!guild) {
            return interaction.reply({ content: "Este comando deve ser executado em um servidor."});
        }

        const user = options.getUser("user", true) as User;
        const role = options.getRole("role", true) as Role;

        const addRoleButton = new ButtonBuilder()
            .setCustomId(`manage-role/add/${user.id}/${role.id}`)
            .setLabel("Adicionar Cargo")
            .setStyle(ButtonStyle.Success);

        const removeRoleButton = new ButtonBuilder()
            .setCustomId(`manage-role/remove/${user.id}/${role.id}`)
            .setLabel("Remover Cargo")
            .setStyle(ButtonStyle.Danger);

        const row = { type: 1, components: [addRoleButton, removeRoleButton] };

        const embed = new EmbedBuilder()
            .setTitle("Gerenciar Cargo")
            .setDescription(`Clique no botão abaixo para adicionar ou remover o cargo **${role.name}** do membro **${user.tag}**.`)
            .setColor("Blue");

        return interaction.reply({ embeds: [embed], components: [row]});
    },
});


new Responder({
    customId: "manage-role/:action/:userId/:roleId",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction: ButtonInteraction, params: { action: string, userId: string, roleId: string }) {
        const { action, userId, roleId } = params;

        if (!interaction.guild) {
            return interaction.reply({ content: `${icon.alert}Este comando deve ser executado em um servidor.`});
        }

        let member: GuildMember;
        let role: Role | null;

        try {
            member = await interaction.guild.members.fetch(userId);
        } catch (error) {
            return interaction.reply({ content: `${icon.close}Membro não encontrado.`});
        }

        try {
            role = await interaction.guild.roles.fetch(roleId);
            if (!role) {
                throw new Error(`${icon.close}Cargo não encontrado.`);
            }
        } catch (error) {
            return interaction.reply({ content: "Cargo não encontrado."});
        }

        const botMember = interaction.guild.members.me;
        if (!botMember) {
            return interaction.reply({ content: "Não foi possível obter as informações do bot."});
        }

        // Verifique se o bot tem permissões para gerenciar cargos
        if (!botMember.permissions.has("ManageRoles")) {
            return interaction.reply({ content: "Eu não tenho permissão para gerenciar cargos." });
        }

        // Verifique se o cargo é maior ou igual ao cargo do bot
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: "Não posso adicionar ou remover um cargo maior ou igual ao meu cargo."});
        }

        let responseEmbed;

        try {
            if (action === "add") {
                if (member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: "O membro já tem este cargo"});
                }
                await member.roles.add(role);
                responseEmbed = new EmbedBuilder()
                    .setTitle("Cargo Adicionado")
                    .setDescription(`${icon.correct}O cargo **${role.name}** foi adicionado ao membro **${member.user.tag}**.`)
                    .setColor("Green");
            } else if (action === "remove") {
                if (!member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: "O membro não tem este cargo." });
                }
                await member.roles.remove(role);
                responseEmbed = new EmbedBuilder()
                    .setTitle("Cargo Removido")
                    .setDescription(`O cargo **${role.name}** foi removido do membro **${member.user.tag}**.`)
                    .setColor("Red");
            } else {
                throw new Error("Ação inválida.");
            }
        } catch (error: any) {
            return interaction.reply({ content: `${icon.close}Erro: ${error.message}`});
        }

        return interaction.reply({ embeds: [responseEmbed] });
    },
});