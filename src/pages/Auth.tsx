import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Loader2, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup State
  const [signupData, setSignupData] = useState({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    coupleName: ''
  });

  // Forgot Password State
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Algo deu errado no login',
        description: error.message === 'Invalid login credentials'
          ? 'Verifique se seu email e senha estão corretos.'
          : error.message
      });
    } else {
      toast({
        title: 'Bem-vindo de volta! 🐷',
        description: 'Seu painel financeiro está pronto.'
      });
      navigate('/dashboard');
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation Steps
    if (!signupData.coupleName.trim()) {
      toast({ variant: 'destructive', title: 'Espaço sem nome', description: 'Dê um nome legal para o seu espaço financeiro!' });
      setIsSubmitting(false);
      return;
    }

    if (signupData.email !== signupData.confirmEmail) {
      toast({ variant: 'destructive', title: 'Emails divergentes', description: 'O campo de confirmação de email não bate com o email.' });
      setIsSubmitting(false);
      return;
    }

    if (signupData.password.length < 6) {
      toast({ variant: 'destructive', title: 'Senha fraca', description: 'Sua senha precisa ter pelo menos 6 caracteres.' });
      setIsSubmitting(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Senhas divergentes', description: 'Revise sua senha e a confirmação.' });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(signupData.email, signupData.password, signupData.coupleName);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível criar a conta',
        description: error.message.includes('already registered')
          ? 'Parece que este email já tem uma conta.'
          : error.message
      });
    } else {
      toast({
        title: 'Conta criada com sucesso! 🎉',
        description: 'Bem-vindo à família PIGMONEY.'
      });
      navigate('/dashboard');
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsForgotSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado! 📨",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setShowForgotDialog(false);
      setForgotEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu email abaixo e enviaremos um link seguro para você redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email cadastrado</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForgotDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isForgotSubmitting}>
                {isForgotSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Enviar Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* LEFT SIDE: BRANDING AREA (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden flex-col justify-between p-12 text-primary-foreground">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary to-primary-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-30 animate-pulse-soft delay-1000" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner-glow">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">PIGMONEY</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="animate-slide-up">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20">
              <span className="text-6xl animate-bounce-in">🐷</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
              O futuro das suas finanças começa aqui.
            </h1>
            <p className="text-lg text-primary-50 leading-relaxed max-w-md">
              Domine suas finanças pessoais, defina metas ousadas e veja seu patrimônio multiplicar com a inteligência do nosso Consultor Pig IA.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-sm font-medium text-primary-100/80">
          <span>© 2025 PIGMONEY</span>
          <span>•</span>
          <span>Privacidade & Segurança</span>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM (Responsive) */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-[420px] animate-fade-in relative z-10">

          {/* Mobile Branding (Visible only on < lg) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">PIGMONEY</h2>
          </div>

          {/* Tabs Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {activeTab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta grátis'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'login'
                ? 'Entre para continuar organizando sua vida.'
                : 'Junte-se a milhares de pessoas inteligentes.'}
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 p-1 bg-muted/50 rounded-2xl border border-border/50">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-2">
                <TabsTrigger
                  value="login"
                  className="h-10 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 font-semibold text-muted-foreground"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="h-10 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 font-semibold text-muted-foreground"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
            </div>

            {/* LOGIN FORM */}
            <TabsContent value="login" className="space-y-6 focus-visible:outline-none">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-medium ml-1">Email</Label>
                  <Input
                    type="email"
                    placeholder="exemplo@pigmoney.com.br"
                    className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground/80 font-medium ml-1">Senha</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotDialog(true)}
                      className="text-xs text-primary font-semibold hover:underline"
                      tabIndex={-1}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Acessar Painel'}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP FORM */}
            <TabsContent value="signup" className="space-y-6 focus-visible:outline-none">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-medium ml-1">Seu Nome ou Apelido</Label>
                  <Input
                    placeholder="Ex: Família Silva"
                    className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                    value={signupData.coupleName}
                    onChange={(e) => setSignupData({ ...signupData, coupleName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-medium ml-1">Seu melhor email</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-medium ml-1">Confirme seu email</Label>
                    <Input
                      type="email"
                      placeholder="Digite o email novamente"
                      className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                      onPaste={(e) => e.preventDefault()} // Force typing to verify
                      value={signupData.confirmEmail}
                      onChange={(e) => setSignupData({ ...signupData, confirmEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-medium ml-1">Crie uma senha segura</Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-medium ml-1">Confirme a senha</Label>
                    <Input
                      type="password"
                      placeholder="Repita a senha"
                      className="h-12 bg-muted/30 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-primary-600" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">Criar minha conta <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Decorative Grid on Right Side (Subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-0" />
      </div>
    </div>
  );
}
