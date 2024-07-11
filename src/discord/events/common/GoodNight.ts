import { Event } from "#base";
import { TextChannel, EmbedBuilder } from "discord.js";
new Event({
    name: "Send Daily Good Night Message",
    event: "ready",
    async run(client) {
        const channelId = "1259162689897369631"; // Substitua pelo ID do seu canal
        const channel = client.channels.cache.get(channelId) as TextChannel;

        if (!channel) {
            console.error("Canal não encontrado!");
            return;
        }

        setInterval(async () => {
            const now = new Date();
            const hours = now.getUTCHours() - 3; // Ajuste para UTC-3
            const minutes = now.getUTCMinutes();

            // Corrige a hora se necessário
            const adjustedHours = hours < 0 ? hours + 24 : hours;

            // Envia a mensagem de "Boa noite" à meia-noite (00:00) horário de Brasília
            if (adjustedHours === 0 && minutes === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("💤 Boa noite! 🌟")
                    .setDescription("Tenham todos uma boa noite de descanso! 💕")
                    .setColor(0x0000FF) // Cor azul
                    .setTimestamp();

                try {
                    await channel.send({ embeds: [embed] });
                    console.log("Mensagem de Boa noite enviada com sucesso!");
                } catch (error) {
                    console.error("Erro ao enviar mensagem: ", error);
                }
            }
        }, 60000); // Verifica a cada minuto (60000ms)
    }
});