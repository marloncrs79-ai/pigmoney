
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Lock, UserCog, CreditCard, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { CancellationModal } from '@/components/CancellationModal';

export default function Settings() {
    const { couple, refreshCouple, plan, updatePlan } = useAuth(); // Assuming updatePlan is exposed in AuthContext based on previous edits
    const { toast } = useToast();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);

    const [workspaceName, setWorkspaceName] = useState(couple?.name || '');
    const [loadingName, setLoadingName] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couple) return;

        setLoadingName(true);
        try {
            const { error } = await supabase
                .from('couples')
                .update({ name: workspaceName })
                .eq('id', couple.id);

            if (error) throw error;

            await refreshCouple();

            toast({
                title: 'Sucesso! ✨',
                description: 'Nome do espaço atualizado.',
            });
        } catch (error: any) {
            toast({
                title: 'Erro ao atualizar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingName(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: 'Senhas não conferem',
                description: 'Por favor, verifique a confirmação da senha.',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Senha muito curta',
                description: 'A senha deve ter pelo menos 6 caracteres.',
                variant: 'destructive',
            });
            return;
        }

        setLoadingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: 'Senha atualizada! 🔒',
                description: 'Sua senha foi alterada com sucesso.',
            });
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast({
                title: 'Erro de segurança',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleCancellation = () => {
        // Logic to downgrade plan
        // Ideally this should communicate with backend to stop stripe/billing 
        // For now, we update local state/context as per the app's current simplicity
        updatePlan('free');
    };

    return (
        <AppLayout>
            <PageHeader
                title="Configurações"
                description="Gerencie sua assinatura, espaço e segurança."
            />

            <div className="grid gap-8 max-w-4xl mx-auto pb-10">

                {/* 1. SEÇÃO MEU PLANO (Topo) */}
                <Card className="border-primary/20 shadow-md animate-slide-up">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Meu Plano</CardTitle>
                                <CardDescription>Gerencie sua assinatura e cobrança.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Status da Assinatura</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-primary capitalize">
                                        Pig {plan === 'annual' ? 'Anual' : plan}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                        Ativo
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                                    {plan === 'free'
                                        ? 'Você está no plano gratuito. Faça upgrade para desbloquear todo o potencial.'
                                        : 'Aproveite todos os recursos premium do PIGMONEY.'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {plan !== 'free' && (
                                    <Button
                                        variant="outline"
                                        className="text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        <SettingsIcon className="mr-2 h-4 w-4" />
                                        Cancelar Plano
                                    </Button>
                                )}
                                <Button
                                    onClick={() => navigate('/plans')}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                >
                                    {plan === 'free' ? 'Fazer Upgrade' : 'Alterar Plano'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. ESPAÇO FINANCEIRO */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-muted rounded-xl">
                                <UserCog className="h-6 w-6 text-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Perfil</CardTitle>
                                <CardDescription>Personalize como você quer ser chamado.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateName} className="space-y-4 max-w-xl">
                            <div className="space-y-2">
                                <Label htmlFor="workspaceName">Seu Nome ou Apelido</Label>
                                <Input
                                    id="workspaceName"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    placeholder="Ex: Minhas Finanças"
                                    className="h-11"
                                />
                            </div>
                            <Button type="submit" disabled={loadingName || !workspaceName.trim()} variant="secondary">
                                {loadingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Alterações
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 3. SEGURANÇA */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-muted rounded-xl">
                                <Lock className="h-6 w-6 text-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Segurança</CardTitle>
                                <CardDescription>Mantenha sua conta segura atualizando sua senha.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loadingPassword || !password} variant="secondary">
                                {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Atualizar Senha
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>

            <CancellationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirmCancellation={handleCancellation}
            />
        </AppLayout>
    );
}

