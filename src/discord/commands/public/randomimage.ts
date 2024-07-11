import { Command } from "#base";
import { ApplicationCommandType, CommandInteraction, EmbedBuilder } from "discord.js";
import fetch from "node-fetch"; // Certifique-se de ter instalado node-fetch

const UNSPLASH_ACCESS_KEY = 'CS6t7_6kg2zRn38F_uHW1vYY2U1nJF6Oto-XCG2w55w'; // Substitua pela sua chave de API

interface UnsplashResponse {
    urls: {
        regular: string;
    };
}

new Command({
    name: "randomimage",
    description: "Gera uma imagem aleatória.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction) {
        await interaction.deferReply(); // Deferindo a resposta para ganhar tempo

        try {
            // Faz uma solicitação à API de Unsplash para obter uma imagem aleatória
            const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`);
            const data: UnsplashResponse = await response.json() as UnsplashResponse;

            // Verifique se a resposta contém a URL da imagem
            if (!data.urls || !data.urls.regular) {
                throw new Error("Não foi possível obter uma imagem aleatória.");
            }

            const imageUrl = data.urls.regular;

            // Crie o embed com a imagem aleatória
            const embed = new EmbedBuilder()
                .setTitle("Aqui está uma imagem aleatória")
                .setImage(imageUrl)
                .setColor("#0099ff")
                .setFooter({ text: "Imagem gerada por Unsplash" })
                .setTimestamp();

            // Envie o embed como resposta
            await interaction.editReply({
                embeds: [embed]
            });
        } catch (error) {
            console.error("Erro ao obter uma imagem aleatória:", error);
            await interaction.editReply("Desculpe, não foi possível obter uma imagem aleatória no momento.");
        }
    },
});