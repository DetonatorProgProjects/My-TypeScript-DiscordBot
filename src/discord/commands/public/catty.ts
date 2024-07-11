import { Command } from "#base";
import fetch from "node-fetch";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

new Command({
    name: "cat",
    description: "Envia uma imagem aleatória de um gato",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Aqui está um gato para você!")
            .setColor("Blue")
            .setTimestamp();

        try {
            // Requisição para obter uma imagem aleatória de um gato
            const response = await fetch("https://api.thecatapi.com/v1/images/search");
            
            // Verifica se a resposta é ok
            if (!response.ok) {
                throw new Error(`Erro na resposta da API: ${response.statusText}`);
            }

            // Converte a resposta para JSON e faz a verificação do tipo
            const data: unknown = await response.json();
            if (!Array.isArray(data) || typeof data[0] !== 'object' || !('url' in data[0])) {
                throw new Error("Resposta da API inválida");
            }

            // Cast para o tipo esperado
            const catData = data as { url: string }[];
            const imageUrl = catData[0].url;

            // Adiciona a imagem de gato ao embed
            embed.setImage(imageUrl);

            // Responde com o embed
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Erro ao obter a imagem de gato:", error);

            embed
                .setTitle("Erro")
                .setDescription("Ocorreu um erro ao tentar obter a imagem de um gato. Tente novamente mais tarde.")
                .setColor("Red");

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
});