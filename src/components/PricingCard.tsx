
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlight?: boolean;
    cta?: string;
    planId?: 'free' | 'pro' | 'annual';
}

export function PricingCard({
    title,
    price,
    period,
    description,
    features,
    highlight,
    cta = "Começar Agora",
    planId
}: PricingCardProps) {
    const { updatePlan, user } = useAuth();
    const navigate = useNavigate();

    const handleSelect = () => {
        if (!user) {
            navigate('/auth?signup=true');
            return;
        }
        if (planId) {
            if (planId === 'free') {
                updatePlan('free');
                navigate('/dashboard');
            } else {
                // Redirect to checkout for paid plans
                navigate(`/checkout?plan=${planId}`);
            }
        }
    };

    return (
        <div className={cn(
            "p-8 rounded-3xl border flex flex-col relative transition-all duration-300 hover:-translate-y-2",
            highlight
                ? "bg-card border-primary shadow-2xl scale-105 z-10"
                : "bg-background/50 border-border hover:border-primary/50 hover:shadow-xl"
        )}>
            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Mais Popular
                </div>
            )}
            <div className="mb-8">
                <h3 className={cn("text-2xl font-bold mb-2", highlight && "text-primary")}>{title}</h3>
                <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-extrabold">{price}</span>
                    <span className="text-muted-foreground mb-1">{period}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className={cn("h-5 w-5 shrink-0", highlight ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-foreground/90">{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                variant={highlight ? "default" : "outline"}
                size="lg"
                className={cn("w-full font-bold", highlight && "shadow-lg shadow-primary/20")}
                onClick={handleSelect}
            >
                {cta}
            </Button>
        </div>
    );
}
