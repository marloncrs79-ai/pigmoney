import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Bug,
    Calculator,
    Database,
    KeyRound,
    RefreshCw,
    Zap,
    MoreHorizontal,
    Paperclip,
    Send,
    Loader2,
    CheckCircle2,
    PiggyBank
} from 'lucide-react';

const problemTypes = [
    { value: 'Bug visual', label: 'Bug visual', icon: Bug },
    { value: 'Erro de cálculo', label: 'Erro de cálculo', icon: Calculator },
    { value: 'Dados inconsistentes', label: 'Dados inconsistentes', icon: Database },
    { value: 'Problema de login', label: 'Problema de login', icon: KeyRound },
    { value: 'Falha de sincronização', label: 'Falha de sincronização', icon: RefreshCw },
    { value: 'Problema de performance', label: 'Problema de performance', icon: Zap },
    { value: 'Outro', label: 'Outro', icon: MoreHorizontal },
];

const impactLevels = [
    { value: 'Baixo', label: 'Baixo', color: 'text-blue-500' },
    { value: 'Médio', label: 'Médio', color: 'text-yellow-500' },
    { value: 'Alto', label: 'Alto', color: 'text-orange-500' },
    { value: 'Crítico', label: 'Crítico', color: 'text-red-500' },
];

export default function ReportProblem() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        tipo: '',
        descricao: '',
        impacto: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tipo || !formData.descricao || !formData.impacto) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        if (!user) {
            toast({
                title: 'Erro de autenticação',
                description: 'Você precisa estar logado para enviar um relatório.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;

            // Upload image if provided
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('report-images')
                    .upload(fileName, imageFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Continue without image if upload fails
                } else if (data) {
                    const { data: urlData } = supabase.storage
                        .from('report-images')
                        .getPublicUrl(data.path);
                    imageUrl = urlData.publicUrl;
                }
            }

            // Insert report - using @ts-ignore until migration is applied and types regenerated
            // @ts-ignore - user_reports table will exist after migration
            const { error } = await supabase.from('user_reports').insert({
                user_id: user.id,
                tipo: formData.tipo,
                descricao: formData.descricao,
                impacto: formData.impacto,
                imagem_url: imageUrl,
            });

            if (error) throw error;

            setSubmitted(true);
            toast({
                title: 'Relatório enviado!',
                description: 'Obrigado por nos ajudar a melhorar o PigMoney.',
            });
        } catch (error: any) {
            console.error('Submit error:', error);
            toast({
                title: 'Erro ao enviar',
                description: error.message || 'Tente novamente em alguns instantes.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'Arquivo muito grande',
                    description: 'O tamanho máximo permitido é 5MB.',
                    variant: 'destructive',
                });
                return;
            }
            setImageFile(file);
        }
    };

    if (submitted) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full border-primary/20 shadow-xl animate-in zoom-in-95 duration-300">
                        <CardContent className="pt-10 pb-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                        <PiggyBank className="h-10 w-10 text-primary" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Obrigado! 🐷
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Seu relatório foi recebido e será analisado em breve pela nossa equipe.
                            </p>
                            <Button
                                onClick={() => {
                                    setSubmitted(false);
                                    setFormData({ tipo: '', descricao: '', impacto: '' });
                                    setImageFile(null);
                                }}
                                variant="outline"
                                className="rounded-full"
                            >
                                Enviar outro relatório
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-emerald-600 p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02bTAgMjRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <PiggyBank className="h-9 w-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">
                            Encontrou algum problema? O Pig te ajuda!
                        </h1>
                        <p className="text-white/80">
                            Descreva o que aconteceu e nossa equipe vai verificar rapidinho.
                        </p>
                    </div>
                </div>
                <AlertCircle className="absolute bottom-4 right-4 h-24 w-24 opacity-10" />
            </div>

            {/* Form Card */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Problem Type */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo" className="text-sm font-semibold">
                                Tipo de Problema *
                            </Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Selecione o tipo de problema" />
                                </SelectTrigger>
                                <SelectContent>
                                    {problemTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao" className="text-sm font-semibold">
                                Descrição Detalhada *
                            </Label>
                            <Textarea
                                id="descricao"
                                placeholder="Descreva o problema: O que aconteceu? Como ocorreu? O que você esperava?"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                className="min-h-[150px] rounded-xl resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Quanto mais detalhes você fornecer, mais rápido conseguiremos resolver.
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Adicionar Imagem (opcional)
                            </Label>
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="image-upload"
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
                                        "hover:border-primary hover:bg-primary/5",
                                        imageFile ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                                    )}
                                >
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {imageFile ? imageFile.name : '📎 Anexar imagem'}
                                    </span>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {imageFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setImageFile(null)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        Remover
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Impact Level */}
                        <div className="space-y-2">
                            <Label htmlFor="impacto" className="text-sm font-semibold">
                                Nível de Impacto *
                            </Label>
                            <Select
                                value={formData.impacto}
                                onValueChange={(value) => setFormData({ ...formData, impacto: value })}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Qual o impacto deste problema?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {impactLevels.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            <span className={level.color}>{level.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Crítico = impede uso do app • Alto = afeta funcionalidade importante • Médio = incômodo • Baixo = cosmético
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Enviar Relatório
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
