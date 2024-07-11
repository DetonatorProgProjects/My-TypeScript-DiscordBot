import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";

new Command({
    name: "serverinfo",
    description: "Mostra informações sobre o servidor.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const { guild } = interaction;
        
        // Obtenha informações do servidor
        const serverName = guild.name;
        const serverID = guild.id;
        const memberCount = guild.memberCount;
        const owner = await guild.fetchOwner();
        const creationDate = guild.createdAt.toDateString();
        const region = guild.preferredLocale;
        const iconURL = guild.iconURL();

        // Crie um embed para exibir as informações
        const embed = {
            title: `${serverName}`,
            thumbnail: { url: iconURL ?? "" },
            fields: [
                { name: "ID do Servidor", value: serverID, inline: true },
                { name: "Nome do Servidor", value: serverName, inline: true },
                { name: "Membros", value: memberCount.toString(), inline: true },
                { name: "Dono do Servidor", value: owner.user.tag, inline: true },
                { name: "Data de Criação", value: creationDate, inline: true },
                { name: "Região", value: region, inline: true }
            ],
            color: 0x00AE86
        };

        // Responda ao comando com o embed
        interaction.reply({ embeds: [embed] });
    },
});