import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowUpRight, ShieldCheck, Users, AlertCircle, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [reportStats, setReportStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // Fetch metrics
                const metricsResponse = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics?range=30`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                if (metricsResponse.ok) {
                    const data = await metricsResponse.json();
                    setMetrics(data);
                }

                // Fetch report stats
                const reportsResponse = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reports/stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                if (reportsResponse.ok) {
                    const data = await reportsResponse.json();
                    setReportStats(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Prepare chart data
    const growthData = metrics?.daily_growth?.slice(-14).map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        usuarios: d.count,
    })) || [];

    const providerData = metrics?.provider_distribution
        ? Object.entries(metrics.provider_distribution).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value as number,
        }))
        : [];

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
                    <p className="text-slate-500">Bem-vindo ao painel administrativo do PigMoney.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : metrics?.total_users ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +{(metrics?.new_users || 0)} no último período
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : metrics?.active_users ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {(metrics && metrics.total_users > 0)
                                    ? ((metrics.active_users / metrics.total_users) * 100).toFixed(1)
                                    : 0}% da base total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Verificação de Email</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : `${metrics?.verified_percentage ?? 0}%`}</div>
                            <p className="text-xs text-muted-foreground">
                                Usuários verificados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{loading ? "..." : metrics?.daily_growth?.slice(-1)[0]?.count || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Novos usuários hoje
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Quick Stats */}
                {reportStats && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Reports Novos</p>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {reportStats.by_status?.['Novo'] || 0}
                                        </div>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-blue-500/50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Críticos Pendentes</p>
                                        <div className="text-2xl font-bold text-red-600">
                                            {reportStats.critical_pending || 0}
                                        </div>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-500/50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Resolvidos</p>
                                        <div className="text-2xl font-bold text-green-600">
                                            {reportStats.by_status?.['Resolvido'] || 0}
                                        </div>
                                    </div>
                                    <ShieldCheck className="h-8 w-8 text-green-500/50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Crescimento de Usuários (14 dias)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    Carregando...
                                </div>
                            ) : growthData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={12}
                                            tickLine={false}
                                            stroke="#94a3b8"
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="#94a3b8"
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="usuarios"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={{ fill: '#6366f1', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#6366f1' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    Sem dados de crescimento disponíveis
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Provedores de Login</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    Carregando...
                                </div>
                            ) : providerData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={providerData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                        >
                                            {providerData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    Sem dados de provedores disponíveis
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
