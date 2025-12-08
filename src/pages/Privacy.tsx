import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para Início
                        </Button>
                    </Link>
                </div>

                <PageHeader
                    title="Política de Privacidade"
                    description="Última atualização: Dezembro de 2025"
                />

                <Card className="mt-6">
                    <CardContent className="p-6">
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6 text-muted-foreground">
                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">1. Introdução</h2>
                                    <p>
                                        No PigMoney, respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. Esta política descreve como coletamos, usamos e compartilhamos suas informações quando você usa nossa plataforma.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">2. Informações que Coletamos</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Dados de Cadastro:</strong> Nome, e-mail e informações de perfil.</li>
                                        <li><strong>Dados Financeiros:</strong> Informações sobre receitas, despesas, orçamentos e transações que você insere manualmente.</li>
                                        <li><strong>Dados de Uso:</strong> Informações sobre como você interage com a plataforma, logs de acesso e tipo de dispositivo.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">3. Como Usamos Seus Dados</h2>
                                    <p>
                                        Utilizamos suas informações para:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 mt-2">
                                        <li>Fornecer e manter o serviço PigMoney.</li>
                                        <li>Gerar relatórios e insights financeiros para você.</li>
                                        <li>Melhorar funcionalidades e desenvolver novos recursos.</li>
                                        <li>Comunicar sobre atualizações, segurança e suporte.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartilhamento de Dados</h2>
                                    <p>
                                        Não vendemos seus dados pessoais a terceiros. Seus dados financeiros são privados e acessíveis apenas por você. Podemos compartilhar dados anonimizados para fins de análise ou se exigido por lei.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">5. Segurança</h2>
                                    <p>
                                        Empregamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">6. Seus Direitos</h2>
                                    <p>
                                        Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações da sua conta. Você também pode solicitar a exportação de seus dados.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">7. Contato</h2>
                                    <p>
                                        Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através do e-mail de suporte disponível na plataforma.
                                    </p>
                                </section>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
