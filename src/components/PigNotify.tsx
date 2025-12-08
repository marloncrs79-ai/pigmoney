import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, PiggyBank, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type PigNotifyProps = {
    type: "error" | "success" | "warning" | "info";
    title?: string;
    message: string;
    show: boolean;
    onClose?: () => void;
    showMascot?: boolean;
};

const typeStyles = {
    error: {
        bg: "bg-danger-50",
        border: "border-danger/20",
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
        icon: AlertCircle,
    },
    success: {
        bg: "bg-success-50",
        border: "border-success/20",
        iconBg: "bg-success/10",
        iconColor: "text-success",
        icon: CheckCircle2,
    },
    warning: {
        bg: "bg-warning-50",
        border: "border-warning/20",
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
        icon: AlertTriangle,
    },
    info: {
        bg: "bg-info-50",
        border: "border-info/20",
        iconBg: "bg-info/10",
        iconColor: "text-info",
        icon: Info,
    },
};

export function PigNotify({ type, title, message, show, onClose, showMascot = true }: PigNotifyProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounting, setIsMounting] = useState(true);

    const style = typeStyles[type];
    const Icon = style.icon;

    // Handle entrance animation
    useEffect(() => {
        if (show) {
            setIsMounting(true);
            // Small delay to allow render before animating in
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            // Wait for exit animation
            const t = setTimeout(() => setIsMounting(false), 300);
            return () => clearTimeout(t);
        }
    }, [show]);

    if (!isMounting && !show) return null;

    return (
        <div
            className={cn(
                "pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 ease-spring",
                style.bg,
                style.border,
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
                "relative" // Ensure relative positioning for absolute elements if needed
            )}
            role="alert"
        >
            <div className="p-4 flex gap-4">
                {/* Mascot / Icon Area */}
                <div className="flex-shrink-0">
                    {showMascot && type === "success" ? (
                        // Special bouncing pig for success
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-in">
                            <span className="text-xl">🐷</span>
                        </div>
                    ) : showMascot && type === "error" ? (
                        // Sad pig for error
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center animate-shake">
                            <span className="text-xl">🐽</span>
                        </div>
                    ) : (
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", style.iconBg)}>
                            <Icon className={cn("h-5 w-5", style.iconColor)} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                    {title && <h3 className={cn("font-bold text-sm mb-1", style.iconColor)}>{title}</h3>}
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors -mr-1 -mt-1 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Progress Line (Optional, decorative) */}
            <div className={cn("h-1 w-full bg-black/5")}>
                <div
                    className={cn("h-full", style.iconBg)}
                />
            </div>
        </div>
    );
}
