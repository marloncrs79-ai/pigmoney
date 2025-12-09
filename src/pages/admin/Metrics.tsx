import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, ArrowUpRight, ShieldCheck, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function AdminMetrics() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(30);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics?range=${range}`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [range]);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Métricas</h1>
                        <p className="text-slate-500">Análise detalhada do crescimento e engajamento.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={range === 7 ? "default" : "outline"}
                            onClick={() => setRange(7)}
                            size="sm"
                        >
                            7 Dias
                        </Button>
                        <Button
                            variant={range === 30 ? "default" : "outline"}
                            onClick={() => setRange(30)}
                            size="sm"
                        >
                            30 Dias
                        </Button>
                        <Button
                            variant={range === 90 ? "default" : "outline"}
                            onClick={() => setRange(90)}
                            size="sm"
                        >
                            90 Dias
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : metrics?.total_users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novos (Neste Período)</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{loading ? "..." : metrics?.new_users}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6">
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle>Crescimento de Usuários - Últimos {range} dias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400">
                                {loading ? <Loader2 className="animate-spin" /> : "Gráfico de Linha (Recharts)"}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="h-[300px]">
                            <CardHeader>
                                <CardTitle>Distribuição por Provider</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {metrics?.provider_distribution && Object.entries(metrics.provider_distribution).map(([provider, count]: any) => (
                                        <div key={provider} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${provider === 'google' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                <span className="capitalize text-sm font-medium">{provider}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-slate-500">{count} usuários</span>
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${provider === 'google' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${(count / metrics.total_users) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
