import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            console.log('[PWA] Service Worker registered:', swUrl);

            // Check for updates every 30 minutes
            if (registration) {
                setInterval(() => {
                    registration.update();
                }, 30 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('[PWA] Service Worker registration failed:', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            setShowUpdate(true);
        }
    }, [needRefresh]);

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    const handleClose = () => {
        setShowUpdate(false);
        setNeedRefresh(false);
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary animate-spin-slow" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">
                        Nova versão disponível!
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        Uma atualização do PIGMONEY está pronta para ser instalada.
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                        <Button
                            size="sm"
                            onClick={handleUpdate}
                            className="text-xs h-8"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Atualizar Agora
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-xs h-8"
                        >
                            Depois
                        </Button>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
