import { Command } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, EmbedBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ApplicationCommandOptionType, MessageComponentInteraction } from "discord.js";

new Command({
    name: "cembed",
    description: "Cria um embed e o envia como resposta com opções adicionais.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "title",
            description: "Título do Embed.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "description",
            description: "Descrição do Embed.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "footer",
            description: "Rodapé do Embed.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "image",
            description: "URL da imagem para o Embed.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "button_label",
            description: "Texto do botão.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "button_url",
            description: "URL do botão.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction: CommandInteraction) {
        await interaction.deferReply(); // Deferindo a resposta para ganhar tempo

        // Coletar opções do usuário
        const title = interaction.options.get("title")?.value as string || "Título do Embed";
        const description = interaction.options.get("description")?.value as string || "Descrição do Embed";
        const footer = interaction.options.get("footer")?.value as string || "Rodapé do Embed";
        const image = interaction.options.get("image")?.value as string || null;
        const buttonLabel = interaction.options.get("button_label")?.value as string || null;
        const buttonUrl = interaction.options.get("button_url")?.value as string || null;

        // Crie o embed
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("#0099ff")
            .setFooter({ text: footer })
            .setTimestamp();

        if (image) {
            embed.setImage(image);
        }

        // Crie um botão se o texto e URL do botão forem fornecidos
        const components = [];
        if (buttonLabel && buttonUrl) {
            const button = new ButtonBuilder()
                .setLabel(buttonLabel)
                .setStyle(ButtonStyle.Link)
                .setURL(buttonUrl);

            components.push(createRow(button));  // Adicione o botão se necessário
        }

        // Envie o embed como resposta
        await interaction.editReply({
            embeds: [embed],
            components: components.length > 0 ? components : [],  // Adicione os componentes se houver botões
        });

        // Adiciona uma interação com o botão se o botão for um botão normal
        if (buttonLabel && !buttonUrl) {
            if (!interaction.channel) {
                return interaction.followUp({ content: 'O canal não está disponível.', ephemeral: true });
            }

            const filter = (i: MessageComponentInteraction) => i.customId === 'embed/button' && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async (i: MessageComponentInteraction) => {
                if (i.customId === 'embed/button') {
                    await i.reply({ content: 'Você clicou no botão!', ephemeral: true });
                }
            });

            collector.on('end', collected => {
                console.log(`Coletado ${collected.size} interação(s)`);
            });
        }
        // Adiciona um retorno no fim do método run para garantir que o código retorne um valor
        return;
    },
});