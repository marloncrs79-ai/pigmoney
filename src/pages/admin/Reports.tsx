import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
    Eye,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';

type Report = {
    id: string;
    user_id: string;
    tipo: string;
    descricao: string;
    imagem_url: string | null;
    impacto: string;
    status: string;
    created_at: string;
    user_email?: string;
};

const statusColors: Record<string, string> = {
    'Novo': 'bg-blue-500',
    'Em análise': 'bg-yellow-500',
    'Resolvido': 'bg-green-500',
};

const statusIcons: Record<string, any> = {
    'Novo': Clock,
    'Em análise': RefreshCw,
    'Resolvido': CheckCircle2,
};

const impactColors: Record<string, string> = {
    'Baixo': 'bg-blue-100 text-blue-700 border-blue-200',
    'Médio': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Alto': 'bg-orange-100 text-orange-700 border-orange-200',
    'Crítico': 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminReports() {
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [impactFilter, setImpactFilter] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    async function fetchReports() {
        try {
            setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: 'Erro de autenticação',
                    description: 'Você precisa estar logado para acessar esta página.',
                    variant: 'destructive',
                });
                return;
            }

            const params = new URLSearchParams({
                page: '1',
                limit: '100',
            });

            if (statusFilter !== 'all') {
                params.set('status', statusFilter);
            }
            if (impactFilter !== 'all') {
                params.set('impacto', impactFilter);
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reports?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao carregar reports');
            }

            const data = await response.json();
            setReports(data.reports || []);
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            toast({
                title: 'Erro ao carregar reports',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReports();
    }, [statusFilter, impactFilter]);

    const handleStatusChange = async (reportId: string, newStatus: string) => {
        try {
            setUpdating(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Não autenticado');
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reports/${reportId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar status');
            }

            setReports(reports.map(r =>
                r.id === reportId ? { ...r, status: newStatus } : r
            ));

            if (selectedReport?.id === reportId) {
                setSelectedReport({ ...selectedReport, status: newStatus });
            }

            toast({
                title: 'Status atualizado',
                description: `Report alterado para "${newStatus}"`,
            });
        } catch (error: any) {
            toast({
                title: 'Erro ao atualizar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const filteredReports = reports.filter(report => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            report.user_email?.toLowerCase().includes(searchLower) ||
            report.tipo.toLowerCase().includes(searchLower) ||
            report.descricao.toLowerCase().includes(searchLower)
        );
    });

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports dos Usuários</h1>
                        <p className="text-slate-500">Gerencie os problemas reportados pelos usuários.</p>
                    </div>
                    <Button onClick={() => fetchReports()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por email ou descrição..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="Novo">Novo</SelectItem>
                            <SelectItem value="Em análise">Em análise</SelectItem>
                            <SelectItem value="Resolvido">Resolvido</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={impactFilter} onValueChange={setImpactFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Impacto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Baixo">Baixo</SelectItem>
                            <SelectItem value="Médio">Médio</SelectItem>
                            <SelectItem value="Alto">Alto</SelectItem>
                            <SelectItem value="Crítico">Crítico</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{reports.length}</div>
                            <p className="text-xs text-muted-foreground">Total de Reports</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">
                                {reports.filter(r => r.status === 'Novo').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Novos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">
                                {reports.filter(r => r.status === 'Em análise').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Em Análise</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">
                                {reports.filter(r => r.impacto === 'Crítico' && r.status !== 'Resolvido').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Críticos Pendentes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Impacto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <AlertCircle className="h-8 w-8" />
                                                <p>Nenhum report encontrado.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => {
                                        const StatusIcon = statusIcons[report.status] || Clock;
                                        return (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {report.tipo}
                                                        {report.imagem_url && (
                                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {report.user_email || report.user_id.slice(0, 8) + '...'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={impactColors[report.impacto]}>
                                                        {report.impacto}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${statusColors[report.status]} hover:${statusColors[report.status]}`}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(report.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setDetailsOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Ver
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Detalhes do Report
                        </DialogTitle>
                        <DialogDescription>
                            Visualize e gerencie este report de problema.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                                    <p className="font-medium">{selectedReport.tipo}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Impacto</label>
                                    <Badge variant="outline" className={impactColors[selectedReport.impacto]}>
                                        {selectedReport.impacto}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Usuário</label>
                                    <p className="font-medium">{selectedReport.user_email || selectedReport.user_id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Data</label>
                                    <p className="font-medium">
                                        {format(new Date(selectedReport.created_at), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                                <div className="mt-1 p-4 bg-muted rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReport.descricao}</p>
                                </div>
                            </div>

                            {selectedReport.imagem_url && (
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Imagem Anexada</label>
                                    <div className="mt-1">
                                        <a
                                            href={selectedReport.imagem_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Ver imagem
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Alterar Status</label>
                                <div className="flex gap-2 mt-2">
                                    {['Novo', 'Em análise', 'Resolvido'].map((status) => (
                                        <Button
                                            key={status}
                                            variant={selectedReport.status === status ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={updating || selectedReport.status === status}
                                            onClick={() => handleStatusChange(selectedReport.id, status)}
                                            className={selectedReport.status === status ? statusColors[status] : ''}
                                        >
                                            {updating && selectedReport.status !== status ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                status
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
