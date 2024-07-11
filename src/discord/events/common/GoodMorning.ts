import { Event } from "#base";
import { TextChannel, EmbedBuilder } from "discord.js";
new Event({
    name: "Send Daily Good Morning Message",
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

            // Envia a mensagem de "Bom Dia" às 05:00 horário de Brasília
            if (adjustedHours === 5 && minutes === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("☀️ Bom Dia! 💞")
                    .setDescription("Desejo a todos um ótimo início de dia!")
                    .setColor(0x00FF00) // Cor verde
                    .setTimestamp();

                try {
                    await channel.send({ embeds: [embed] });
                    console.log("Mensagem de Bom Dia enviada com sucesso!");
                } catch (error) {
                    console.error("Erro ao enviar mensagem: ", error);
                }
            }
        }, 60000); // Verifica a cada minuto (60000ms)
    }
});