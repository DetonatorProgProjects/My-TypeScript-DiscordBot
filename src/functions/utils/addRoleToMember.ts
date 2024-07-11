import { GuildMember, Role } from 'discord.js';

/**
 * Adiciona um cargo a um usuário.
 * @param member O membro ao qual o cargo será adicionado.
 * @param role O cargo a ser adicionado.
 * @returns `true` se o cargo foi adicionado com sucesso, caso contrário `false`.
 */
export async function addRoleToMember(member: GuildMember, role: Role): Promise<boolean> {
    try {
        await member.roles.add(role);
        return true;
    } catch (error) {
        console.error(`Erro ao adicionar cargo ${role.name} ao membro ${member.user.tag}: ${error}`);
        return false;
    }
}


