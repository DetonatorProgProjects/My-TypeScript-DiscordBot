import { GuildMember, Role } from "discord.js";

/**
 * Remove um cargo de um usuário.
 * @param member O membro do qual o cargo será removido.
 * @param role O cargo a ser removido.
 * @returns `true` se o cargo foi removido com sucesso, caso contrário `false`.
 */
export async function removeRoleFromMember(member: GuildMember, role: Role): Promise<boolean> {
    try {
        await member.roles.remove(role);
        return true;
    } catch (error) {
        console.error(`Erro ao remover cargo ${role.name} do membro ${member.user.tag}: ${error}`);
        return false;
    }
}