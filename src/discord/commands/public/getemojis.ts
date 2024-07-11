import { Command } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder } from "discord.js";

new Command({
    name: "getemojis",
    description: "Get emojis from server | bot on a .json file",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "origem",
            description: "Origem dos emojis",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "server", value: "guild" },
                { name: "bot", value: "client" },
            ]
        }
    ],
    async run(interaction){
        const { options } = interaction;
        const source = (options.getString("origem") ?? "guild") as "client" | "guild";
        const emojis = interaction[source].emojis.cache;
        const [animatedEmojis, staticEmojis] = emojis.partition(e => !!e.animated);
        const json = {
            animated: animatedEmojis.reduce(
                (obj, { id, name}) => Object.assign(obj, { [ name??id ]: id}), {}
            ),
            static: staticEmojis.reduce(
                (obj, { id, name}) => Object.assign(obj, { [ name??id ]: id}), {}
            )
        };
        const buffer = Buffer.from(JSON.stringify(json, null, 2));
        const attachment = new AttachmentBuilder(buffer, { name: "Emojis.json"});
        interaction.reply({ ephemeral, content: "List of emojis", files: [attachment]})
    }
});