import { PlanType } from '@/contexts/AuthContext';

/**
 * Returns the user-facing label for a subscription plan.
 * @param plan - The user's current plan type
 * @returns A formatted string like "Usuário: Pig Pro"
 */
export function getUserPlanLabel(plan: PlanType | null | undefined): string {
    switch (plan) {
        case 'free':
            return 'Pig Free';
        case 'pro':
            return 'Pig Pro';
        case 'annual':
            return 'Pig VIP';
        default:
            return 'Plano Indefinido';
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

/**
 * Calculates the renewal date based on plan type and start date.
 * @param plan - The user's current plan type
 * @param startDate - The date when the plan was started/renewed (ISO string)
 * @returns A Date object representing the renewal date, or null for free plans
 */
export function getRenewalDate(plan: PlanType | null | undefined, startDate: string | null): Date | null {
    if (!plan || plan === 'free' || !startDate) {
        return null;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
        return null;
    }

    const renewalDate = new Date(start);

    if (plan === 'pro') {
        // Monthly: +30 days
        renewalDate.setDate(renewalDate.getDate() + 30);
    } else if (plan === 'annual') {
        // Annual: +365 days
        renewalDate.setDate(renewalDate.getDate() + 365);
    }

    return renewalDate;
}

/**
 * Formats the renewal date for display.
 * @param renewalDate - The renewal date
 * @returns Formatted string like "11/01/2026"
 */
export function formatRenewalDate(renewalDate: Date | null): string {
    if (!renewalDate) {
        return '';
    }

    return renewalDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
