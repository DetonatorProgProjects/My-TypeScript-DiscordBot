import { Command } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder } from "discord.js";

new Command({
    name: "getemojis",
    description: "get emojis from server or bot",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "orign",
            description: "Orign from emojis",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "server", value: "guild" },
                { name: "bot", value: "client" },
                   
            ]
        }
    ],
    async run(interaction){
        const { options } = interaction;
        const source = (options.getString("orign") ?? "guild") as "client" | "guild";
        const emojis = interaction[source].emojis.cache;
        const [ animatedEmojis, StaticEmojis ] = emojis.partition(e => !!e.animated);
        const json = {
            animated: animatedEmojis.reduce(
                (obj, { id, name }) => Object.assign(obj, { [name??id]: id}), {}
            ),
            static: StaticEmojis.reduce(
                (obj, { id, name }) => Object.assign(obj, { [name??id]: id}), {}
            ),
        };
        const buffer = Buffer.from(JSON.stringify(json, null, 2));
        const attachment = new AttachmentBuilder(buffer, { name: "emojis.json"});

        interaction.reply({ ephemeral, content: "List of emojis", files: [attachment] });
    }
});