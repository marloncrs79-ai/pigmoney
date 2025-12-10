import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Search,
    Loader2,
    RefreshCw,
    AlertCircle,
    XCircle,
    TrendingDown
} from 'lucide-react';

type Cancellation = {
    id: string;
    user_id: string;
    reason: string;
    details: string | null;
    created_at: string;
    user_email?: string;
};

const REASON_COLORS: Record<string, string> = {
    'Ficou caro': 'bg-red-100 text-red-700 border-red-200',
    'Não entendi como usar': 'bg-orange-100 text-orange-700 border-orange-200',
    'Encontrei outro app': 'bg-purple-100 text-purple-700 border-purple-200',
    'Problemas técnicos': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Pouco útil pra mim': 'bg-blue-100 text-blue-700 border-blue-200',
    'Outro': 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function AdminCancellations() {
    const { toast } = useToast();
    const [cancellations, setCancellations] = useState<Cancellation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [reasonFilter, setReasonFilter] = useState<string>('all');

    async function fetchCancellations() {
        try {
            setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Não autenticado');
            }

            const params = new URLSearchParams();
            if (reasonFilter !== 'all') {
                params.set('reason', reasonFilter);
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-cancellations?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao carregar cancelamentos');
            }

            const data = await response.json();
            setCancellations(data.cancellations || []);
        } catch (error: any) {
            console.error('Error fetching cancellations:', error);
            toast({
                title: 'Erro ao carregar cancelamentos',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCancellations();
    }, [reasonFilter]);

    const filteredCancellations = cancellations.filter(c => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            c.user_email?.toLowerCase().includes(searchLower) ||
            c.reason.toLowerCase().includes(searchLower) ||
            c.details?.toLowerCase().includes(searchLower)
        );
    });

    // Get unique reasons for filter
    const uniqueReasons = [...new Set(cancellations.map(c => c.reason))];

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cancelamentos</h1>
                        <p className="text-slate-500">Visualize os cancelamentos de planos e motivos.</p>
                    </div>
                    <Button onClick={() => fetchCancellations()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <div className="text-2xl font-bold">{cancellations.length}</div>
                            </div>
                            <p className="text-xs text-muted-foreground">Total de Cancelamentos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">
                                {cancellations.filter(c => c.reason.includes('caro') || c.reason.includes('Preço')).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Por Preço</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-600">
                                {cancellations.filter(c => c.reason.includes('entendi') || c.reason.includes('Dificuldade')).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Por Dificuldade</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-purple-600">
                                {cancellations.filter(c => c.reason.includes('outro') || c.reason.includes('Encontrei')).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Por Concorrência</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por email ou motivo..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={reasonFilter} onValueChange={setReasonFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por motivo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Motivos</SelectItem>
                            {uniqueReasons.map(reason => (
                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead>Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCancellations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <TrendingDown className="h-8 w-8" />
                                                <p>Nenhum cancelamento encontrado.</p>
                                                <p className="text-xs">Isso é uma boa notícia! 🎉</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCancellations.map((cancellation) => (
                                        <TableRow key={cancellation.id}>
                                            <TableCell className="font-medium">
                                                {cancellation.user_email || cancellation.user_id.slice(0, 8) + '...'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={REASON_COLORS[cancellation.reason] || REASON_COLORS['Outro']}
                                                >
                                                    {cancellation.reason}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {cancellation.details || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(cancellation.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
