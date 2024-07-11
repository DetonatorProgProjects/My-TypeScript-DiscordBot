import { Command } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { request } from "undici";

interface DogApiResponse {
    message: string;
    status: string;
}

new Command({
    name: "dog",
    description: "Gera uma imagem de cachorro",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const response = await request("https://dog.ceo/api/breeds/image/random");
            const data = await response.body.json() as DogApiResponse;

            if (data.status !== "success") {
                interaction.reply({ ephemeral, content: "Não foi possível obter a imagem do cachorro. Tente novamente mais tarde." });
                return;
            }

            const dogImageUrl = data.message;

            const embed = new EmbedBuilder()
                .setTitle("Aqui está um cachorro fofo!")
                .setImage(dogImageUrl)
                .setColor("Blue");

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao obter a imagem do cachorro:", error);
            interaction.reply({ ephemeral, content: "Ocorreu um erro ao tentar obter a imagem do cachorro. Tente novamente mais tarde." });
        }
    },
});