import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Headphones,
    Mail,
    MessageCircle,
    Clock,
    CheckCircle2,
    Heart,
    PiggyBank,
    Sparkles,
    ExternalLink
} from 'lucide-react';

export default function SupportCentral() {


    const handleWhatsAppClick = () => {
        const message = encodeURIComponent('Olá! Preciso de ajuda no PigMoney 🐷💚');
        window.open(`https://wa.me/5537999696256?text=${message}`, '_blank');
    };

    return (
        <AppLayout>
            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-emerald-600 p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02bTAgMjRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Headphones className="h-9 w-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">
                            Central de Suporte
                        </h1>
                        <p className="text-white/80">
                            Estamos aqui para te ajudar. Escolha como prefere falar com o Pig!
                        </p>
                    </div>
                </div>
                <Sparkles className="absolute bottom-4 right-4 h-24 w-24 opacity-10" />
            </div>

            {/* Contact Options */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Email Card */}
                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="relative p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Mail className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Suporte por E-mail</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Envie sua dúvida e responderemos o mais rápido possível.
                            </p>
                            <Badge variant="outline" className="mb-6 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                Seg a Sex — 08:00 às 17:00
                            </Badge>
                            <div className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium select-all border border-slate-200 dark:border-slate-700">
                                contato@pigmoney.com.br
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WhatsApp Card */}
                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="relative p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MessageCircle className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Atendimento rápido e direto pelo WhatsApp.
                            </p>
                            <Badge variant="outline" className="mb-6 flex items-center gap-1.5 border-green-300 text-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Resposta em até 2 horas
                            </Badge>
                            <Button
                                onClick={handleWhatsAppClick}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Atendimento WhatsApp
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Card */}
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-emerald-500/5">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                            <PiggyBank className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                O Pig trabalha duro para você
                                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Nossa missão é deixar sua vida financeira mais fácil. Se algo não está funcionando como esperado, queremos saber! Cada feedback nos ajuda a melhorar.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Tempo médio de resposta: 2h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Suporte humanizado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Resolvemos 95% dos casos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Friendly Message */}
            <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    O Pig trabalha duro para deixar sua vida financeira mais fácil 🐷✨
                    <Sparkles className="h-4 w-4 text-primary" />
                </p>
            </div>
        </AppLayout>
    );
}
