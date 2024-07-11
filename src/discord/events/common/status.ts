import { Event } from '#base';
import { ActivityType } from 'discord.js';
new Event({
    name: 'Bot Status Setup',
    event: 'ready',
    async run(client) {
        client.user?.setPresence({
            activities: [
                {
                    name: 'TypeScript',
                    type: ActivityType.Watching, // Tipo de atividade
                },
            ],
            status: 'online', // Status geral
        });
    },
});
