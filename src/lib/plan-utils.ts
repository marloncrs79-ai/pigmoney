import { PlanType } from '@/contexts/AuthContext';

/**
 * Returns the user-facing label for a subscription plan.
 * @param plan - The user's current plan type
 * @returns A formatted string like "Usuário: Pig Pro"
 */
export function getUserPlanLabel(plan: PlanType | null | undefined): string {
    switch (plan) {
        case 'free':
            return 'Usuário: Pig Free';
        case 'pro':
            return 'Usuário: Pig Pro';
        case 'annual':
            return 'Usuário: Pig VIP';
        default:
            return 'Usuário: Plano Indefinido';
    }
}

/**
 * Returns a short badge-style label for the plan.
 */
export function getPlanBadge(plan: PlanType | null | undefined): string {
    switch (plan) {
        case 'free':
            return 'FREE';
        case 'pro':
            return 'PRO';
        case 'annual':
            return 'VIP';
        default:
            return '—';
    }
}
