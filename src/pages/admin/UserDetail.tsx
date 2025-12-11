import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    ArrowLeft,
    ShieldAlert,
    Trash2,
    Lock,
    Unlock,
    Mail,
    Calendar,
    Wifi,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchUser() {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                toast({ title: "Erro", description: "Usuário não encontrado", variant: "destructive" });
                navigate('/admin/users');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) fetchUser();
    }, [id]);

    async function handleAction(action: string, params: any = {}) {
        try {
            setActionLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/${id}/action`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, ...params })
            });

            if (response.ok) {
                toast({ title: "Sucesso", description: "Ação realizada com sucesso." });
                if (action === 'delete_user') {
                    navigate('/admin/users');
                } else {
                    fetchUser();
                }
            } else {
                const err = await response.json();
                throw new Error(err.error);
            }
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    if (!user) return null;

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Detalhes do Usuário</h1>
                        <p className="text-slate-500 font-mono text-sm">{user.id}</p>
                    </div>
                    {user.is_admin && <Badge variant="secondary" className="ml-auto">Administrador</Badge>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Mail className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-slate-600">{user.email}</p>
                                </div>
                                {user.email_confirmed_at ? (
                                    <Badge className="ml-auto bg-emerald-500">Verificado</Badge>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-xs"
                                        onClick={() => handleAction('verify_email')}
                                        disabled={actionLoading}
                                    >
                                        Confirmar Manualmente
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Wifi className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium">Provider</p>
                                    <p className="text-sm text-slate-600 capitalize">{user.provider}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium">Criado em</p>
                                    <p className="text-sm text-slate-600">
                                        {format(new Date(user.created_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Activity className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium">Último Login</p>
                                    <p className="text-sm text-slate-600">
                                        {user.last_sign_in_at
                                            ? format(new Date(user.last_sign_in_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })
                                            : 'Nunca'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Administrativas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Segurança
                                </h3>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAction('reset_password', { email: user.email })}
                                        disabled={actionLoading}
                                    >
                                        Enviar Reset de Senha
                                    </Button>
                                    {user.is_admin ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction('remove_admin')}
                                            disabled={actionLoading}
                                        >
                                            Remover Admin
                                        </Button>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">Tornar Admin</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Isso dará acesso total a este usuário ao painel administrativo.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleAction('make_admin')}>
                                                        Confirmar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border border-red-100 bg-red-50/50 rounded-lg space-y-3">
                                <h3 className="font-medium text-red-900 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4" /> Zona de Perigo
                                </h3>
                                <div className="flex gap-3">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={actionLoading}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Deletar Conta
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir usuário permanentemente?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Todos os dados serão perdidos.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleAction('delete_user')}
                                                >
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    {user.ban_duration && user.ban_duration !== 'none' ? (
                                        <Button
                                            variant="outline"
                                            className="bg-white"
                                            size="sm"
                                            onClick={() => handleAction('unblock_user')}
                                            disabled={actionLoading}
                                        >
                                            <Unlock className="h-4 w-4 mr-2" />
                                            Desbloquear
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                            size="sm"
                                            onClick={() => handleAction('block_user')}
                                            disabled={actionLoading}
                                        >
                                            <Lock className="h-4 w-4 mr-2" />
                                            Bloquear Acesso
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Metadados Brutos (Debug)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                            {JSON.stringify({ user_metadata: user.user_metadata, app_metadata: user.app_metadata }, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
