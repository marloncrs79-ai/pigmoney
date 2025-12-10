import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    async function fetchUsers() {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: search
            });

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?${params}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Admin Users API Payload:', data);
                setUsers(data.users);
                setTotal(data.total);
            } else {
                const errorData = await response.json();
                console.error('Admin API Error:', errorData);
                // Assume toast is available or use alert strictly for debugging if toast hook not present in this file?
                // Wait, use-toast is not imported. I should import it.
                throw new Error(errorData.error || 'Falha ao carregar usuários');
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast({
                title: "Erro ao carregar usuários",
                description: error.message || "Verifique se você tem permissão de administrador.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [page, search]); // Re-fetch when page or search changes

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h1>
                        <p className="text-slate-500">Gerenciamento de base de usuários.</p>
                    </div>
                    <Button onClick={() => fetchUsers()}>Atualizar</Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por email..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
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
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nenhum usuário encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.email}
                                                {user.is_admin && (
                                                    <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.provider}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(user.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                                {user.email_confirmed_at ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Verificado</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Pendente</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => window.location.href = `/admin/users/${user.id}`}>Detalhes</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Simplistic Pagination */}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">Página {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={users.length < 20}
                    >
                        Próxima
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
