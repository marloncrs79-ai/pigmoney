import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAdmin() {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            setIsAdmin(false);
            setIsChecking(false);
            return;
        }

        const checkAdmin = async () => {
            // Check metadata
            const adminFlag =
                user.user_metadata?.is_admin === true ||
                user.app_metadata?.is_admin === true;

            if (!adminFlag) {
                setIsAdmin(false);
            } else {
                setIsAdmin(true);
            }
            setIsChecking(false);
        };

        checkAdmin();
    }, [user, loading]);

    return { isAdmin, isChecking, user, loading };
}

export function useAdminGuard() {
    const { isAdmin, isChecking, loading } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isChecking && !isAdmin) {
            navigate('/dashboard');
        }
    }, [isAdmin, isChecking, loading, navigate]);

    return { isAdmin, isChecking, loading };
}
