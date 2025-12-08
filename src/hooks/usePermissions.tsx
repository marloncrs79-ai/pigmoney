
import { useAuth, PlanType } from '@/contexts/AuthContext';

export function usePermissions() {
    const { plan } = useAuth();

    const canAccessAI = plan === 'pro' || plan === 'annual';
    const canAccessAdvancedReports = plan === 'pro' || plan === 'annual';
    const canAccessFutureProjection = plan === 'pro' || plan === 'annual';

    return {
        canAccessAI,
        canAccessAdvancedReports,
        canAccessFutureProjection,
        plan
    };
}
