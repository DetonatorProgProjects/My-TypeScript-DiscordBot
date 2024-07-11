import { Command } from "#base";
import { EmbedBuilder, ApplicationCommandType } from "discord.js";

new Command({
    name: "randomcolor",
    description: "Gera uma cor hexadecimal aleatória e mostra uma imagem da cor com valores HEX e RGB.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Gera uma cor hexadecimal aleatória
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const randomColorHex = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
        const randomColorRGB = `rgb(${r}, ${g}, ${b})`;

        // Cria um embed com a cor, a imagem da cor e os valores HEX e RGB
        const embed = new EmbedBuilder()
            .setTitle("Cor Aleatória")
            .setDescription("Aqui está uma cor aleatória com seus valores HEX e RGB!")
            .addFields(
                {
                    name: "Código HEX",
                    value: randomColorHex,
                    inline: true,
                },
                {
                    name: "Código RGB",
                    value: randomColorRGB,
                    inline: true,
                }
            )
            .setImage(`https://www.thecolorapi.com/id?format=png&hex=${randomColorHex.slice(1).toLowerCase()}`)  // Adiciona a imagem da cor
            .setColor(randomColorHex as `#${string}`);  // Define a cor do embed

        // Envia a resposta com o embed
        await interaction.reply({
            embeds: [embed]
        });
    },
});