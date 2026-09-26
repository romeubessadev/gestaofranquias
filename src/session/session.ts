import { stores } from "@/data/wedash/stores";
import { tenant } from "@/data/wedash/tenant";
import type { Role, User } from "@/data/wedash/team";
import { personName } from "@/lib/format";

/**
 * App session (membership + scope). With Supabase, hydrated after Auth;
 * in demo, built from the User fixture.
 */
export interface Session {
  membershipId: string;
  /** Identity contact name; chrome uses companyName. */
  name: string;
  cpf: string;
  email: string;
  role: Role;
  isOwner: boolean;
  /** Resolved store ids in scope (owner = all). */
  stores: string[];
  collaboratorId: string | null;
  /** null = onboarding complete. */
  onboardingStep: number | null;
  /** true = must change password before onboarding/app. */
  temporaryPassword: boolean;
  tenantId: string;
  /** Company display name (onboarding / tenant.display_name). */
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  /** Installed the PWA? Used for the persistent install notice. */
  appInstalled: boolean;
}

export function sessionFromUser(u: User): Session {
  return {
    membershipId: u.membershipId,
    name: personName(u.name),
    cpf: u.cpf,
    email: u.email,
    role: u.role,
    isOwner: u.isOwner,
    stores: u.stores.length ? u.stores : stores.map((f) => f.id),
    collaboratorId: u.collaboratorId,
    onboardingStep: u.onboardingStep,
    temporaryPassword: u.temporaryPassword ?? false,
    tenantId: tenant.id,
    companyName: tenant.nomeExibicao,
    companySlug: tenant.slug,
    companyLogoUrl: tenant.logoUrl,
    appInstalled: false,
  };
}

export const roleLabel: Record<Role, string> = {
  ADMIN_GLOBAL: "Admin",
  OWNER: "Gestor",
  MANAGER: "Gerente",
  SELLER: "Equipe de vendas",
};
