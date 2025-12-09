import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-logs?limit=50`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLogs();
    }, []);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Logs de Auditoria</h1>
                    <p className="text-slate-500">Histórico de ações administrativas e eventos do sistema.</p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Alvo</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nenhum log encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.admin_email}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.target_email || '-'}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono max-w-[200px] truncate" title={JSON.stringify(log.metadata, null, 2)}>
                                                {JSON.stringify(log.metadata)}
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
