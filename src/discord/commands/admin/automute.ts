import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from "discord.js";
import ms from 'ms';

new Command({
    name: "automute",
    description: "Configura uma regra de automute para um usuário com base em ações específicas",
    options: [
        {
            name: "tempo",
            type: ApplicationCommandOptionType.String,
            description: "Duração do mudo. Exemplo: 10m para 10 minutos, 2h para 2 horas",
            required: true,
        },
        {
            name: "motivo",
            type: ApplicationCommandOptionType.String,
            description: "Motivo do mudo",
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const tempo = interaction.options.getString("tempo", true);
        const motivo = interaction.options.getString("motivo", true);

        // Convertendo o tempo para milissegundos usando o pacote ms
        const duracao = ms(tempo);
        if (!duracao) {
            return interaction.reply({
                content: "Tempo inválido. Use um formato válido, como 10m para 10 minutos ou 2h para 2 horas.",
                ephemeral: true,
            });
        }

        // Verifique se o bot tem a permissão de gerenciar permissões de membros
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return interaction.reply({
                content: "Eu não tenho permissão para silenciar membros.",
                ephemeral: true,
            });
        }

        // Verifique se o comando foi emitido por um moderador com permissões adequadas
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: "Você não tem permissão para configurar regras de automute.",
                ephemeral: true,
            });
        }

        // Enviar um embed de sucesso
        const embed = new EmbedBuilder()
            .setTitle("Regra de Automute Configurada")
            .setDescription(`Regra de automute configurada para silenciar um usuário por ${tempo} por motivo: ${motivo}.`)
            .setColor("#ff0000");

        await interaction.reply({ embeds: [embed] });

        // Adiciona um listener para o evento 'messageCreate' para aplicar o mudo
        interaction.client.on('messageCreate', async (message) => {
            // Verifique se a mensagem é de um membro e se o mudo já não está ativo
            if (message.member && !message.member.communicationDisabledUntil) {
                // Adiciona sua lógica para detectar ações que devem acionar o automute
                // Exemplo: spam ou comportamento inadequado
                // A lógica de detecção deve ser definida conforme suas necessidades
                if (message.content.includes('spam')) { // Substitua isso pela sua lógica de filtro
                    try {
                        // Aplicar o mudo ao membro
                        await message.member.disableCommunicationUntil(Date.now() + duracao, motivo);

                        // Remover o mudo após o tempo definido
                        setTimeout(async () => {
                            try {
                                // Verificar se o mudo ainda está ativo antes de removê-lo
                                if (message.member?.communicationDisabledUntil) {
                                    await message.member.disableCommunicationUntil(null);  // Remove o mudo
                                    console.log(`Usuário ${message.author.tag} desmutado após ${tempo}.`);
                                }
                            } catch (error) {
                                console.error("Erro ao remover mudo do usuário:", error);
                            }
                        }, duracao); // Usar a duração definida em ms
                    } catch (error) {
                        console.error("Erro ao aplicar mudo ao usuário:", error);
                    }
                }
            }
        });

        return undefined; // Adiciona esta linha para satisfazer o TypeScript
    },
});