import { Event } from "#base";
import { EmbedBuilder, ChannelType } from "discord.js";

declare module 'discord.js' {
    interface Client {
        spamMessages: Map<string, number[]>; // Adiciona a propriedade `spamMessages` ao cliente
    }
}

new Event({
    name: "AutoMod",
    event: "messageCreate",
    async run(message) {
        if (message.author.bot) return;

        // ID do servidor onde a detecção de spam deve funcionar
        const serverId = "1259162688697925652";

        // Verifica se a mensagem está sendo enviada no servidor específico
        if (message.guild?.id !== serverId) return;

        // Verifica palavras proibidas
        const forbiddenWords = ["spam", "offensiveWord", "anotherBadWord"];
        const containsForbiddenWords = forbiddenWords.some(word => message.content.toLowerCase().includes(word));

        if (containsForbiddenWords) {
            // Deleta a mensagem
            await message.delete();

            // Cria um embed para o aviso ao autor da mensagem
            const warningEmbed = new EmbedBuilder()
                .setColor("#FF0000")  // Cor vermelha para alertar sobre o problema
                .setTitle("Mensagem Removida")
                .setDescription("Sua mensagem foi removida por conter palavras proibidas. Por favor, siga as regras do servidor.")
                .setFooter({ text: "Equipe de Moderação" });

            await message.author.send({ embeds: [warningEmbed] }).catch(() => {}); // Adiciona um tratamento para possíveis erros ao enviar a DM

            // Cria um embed para o log da moderação
            const logEmbed = new EmbedBuilder()
                .setColor("#FF0000")  // Cor vermelha para log de moderação
                .setTitle("Ação de Moderação")
                .setDescription(`Mensagem de ${message.author.tag} foi deletada por conter palavras proibidas.`)
                .addFields(
                    { name: "Autor", value: message.author.tag, inline: true },
                    { name: "Canal", value: message.channel.type === ChannelType.DM ? "DM" : message.channel.name, inline: true },
                    { name: "Conteúdo da Mensagem", value: message.content },
                    { name: "Data", value: new Date().toLocaleString() }
                )
                .setFooter({ text: "Equipe de Moderação" });

            // Envia o embed de log para um canal de logs (substitua `logChannelId` pelo ID do canal de log)
            const logChannel = message.client.channels.cache.get("1259162689712947315");
            if (logChannel?.isTextBased()) {
                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        // Inicializa `spamMessages` se não existir
        if (!message.client.spamMessages) {
            message.client.spamMessages = new Map();
        }

        // Detecção de Spam
        const spamLimit = 5; // Número máximo de mensagens permitidas em um intervalo
        const spamInterval = 10000; // Intervalo para a detecção de spam (10 segundos)

        // Adiciona o usuário e a mensagem ao mapa de mensagens
        const userMessages = message.client.spamMessages;
        const userId = message.author.id;
        const now = Date.now();
        const userLog = userMessages.get(userId) || [];

        // Remove mensagens antigas que estão fora do intervalo de spam
        const recentMessages = userLog.filter(timestamp => now - timestamp < spamInterval);

        // Adiciona a mensagem atual ao log
        recentMessages.push(now);
        userMessages.set(userId, recentMessages);

        if (recentMessages.length > spamLimit) { // Se o usuário enviar mais de 5 mensagens em 10 segundos
            await message.delete();

            // Cria um embed para o aviso ao autor da mensagem
            const spamWarningEmbed = new EmbedBuilder()
                .setColor("#FF0000")  // Cor vermelha para alertar sobre o problema
                .setTitle("Aviso de Spam")
                .setDescription("Você está enviando mensagens em excesso. Por favor, evite spam.")
                .setFooter({ text: "Equipe de Moderação" });

            await message.author.send({ embeds: [spamWarningEmbed] }).catch(() => {}); // Adiciona um tratamento para possíveis erros ao enviar a DM

            // Cria um embed para o log da moderação
            const spamLogEmbed = new EmbedBuilder()
                .setColor("#FF0000")  // Cor vermelha para log de moderação
                .setTitle("Ação de Moderação - Spam")
                .setDescription(`Mensagem de ${message.author.tag} foi deletada por spam.`)
                .addFields(
                    { name: "Autor", value: message.author.tag, inline: true },
                    { name: "Canal", value: message.channel.type === ChannelType.DM ? "DM" : message.channel.name, inline: true },
                    { name: "Conteúdo da Mensagem", value: message.content },
                    { name: "Data", value: new Date().toLocaleString() }
                )
                .setFooter({ text: "Equipe de Moderação" });

            // Envia o embed de log para um canal de logs (substitua `logChannelId` pelo ID do canal de log)
            const logChannel = message.client.channels.cache.get("1259162689712947316");
            if (logChannel?.isTextBased()) {
                await logChannel.send({ embeds: [spamLogEmbed] });
            }
        }
    }
});