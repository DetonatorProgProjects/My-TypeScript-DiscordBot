import { Event } from "#base";

import { Client, TextChannel } from "discord.js";

new Event({
    name: "Good Night Message",
    event: "ready",
    async run(client: Client) {
        const channelId = "1259162689897369631"; // Substitua pelo ID do canal onde você quer enviar a mensagem
        const targetHour = 23; // Hora em que a mensagem será enviada (22 para 22:00)
        const targetMinute = 0; // Minuto em que a mensagem será enviada (0 para 22:00)

        setInterval(() => {
            const now = new Date();
            const hourBrasilia = (now.getUTCHours() - 3 + 24) % 24; // Ajuste para o horário de Brasília (UTC-3)
            const minuteBrasilia = now.getUTCMinutes();

            if (hourBrasilia === targetHour && minuteBrasilia === targetMinute) {
                const channel = client.channels.cache.get(channelId) as TextChannel;
                if (channel) {
                    channel.send({
                        embeds: [
                            {
                                title: "🌟 Boa noite! 💕",
                                description: "🌙 Desejo a todos uma boa noite! 💤",
                                color: 581845,
                                timestamp: new Date().toISOString(), // Convertendo para string
                            },
                        ],
                    });
                }
            }
        }, 60000); // Verifica a cada minuto (60000 ms)
    },
});