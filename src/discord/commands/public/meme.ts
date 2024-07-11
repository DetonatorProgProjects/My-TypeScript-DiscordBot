import { Command } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

interface Meme {
    id: string;
    name: string;
    url: string;
    width: number;
    height: number;
    box_count: number;
}

interface MemeAPIResponse {
    success: boolean;
    data: {
        memes: Meme[];
    };
}

new Command({
    name: "meme",
    description: "Mostra um meme aleatório",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const response = await fetch("https://api.imgflip.com/get_memes");
            if (!response.ok) {
                return interaction.reply({ content: "Não foi possível obter um meme. Tente novamente mais tarde.", ephemeral: true });
            }

            const data = await response.json() as MemeAPIResponse;

            if (!data.success || !data.data.memes || data.data.memes.length === 0) {
                return interaction.reply({ content: "Não foi possível obter um meme. Tente novamente mais tarde.", ephemeral: true });
            }

            const memes = data.data.memes;
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];

            const embed = new EmbedBuilder()
                .setTitle(randomMeme.name)
                .setImage(randomMeme.url)
                .setColor("Random");

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Ocorreu um erro ao tentar obter um meme. Tente novamente mais tarde.", ephemeral: true });
        }
    },
});