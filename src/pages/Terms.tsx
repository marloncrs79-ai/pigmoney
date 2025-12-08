import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
                    title="Termos de Uso"
                    description="Última atualização: Dezembro de 2025"
                />

                <Card className="mt-6">
                    <CardContent className="p-6">
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6 text-muted-foreground">
                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
                                    <p>
                                        Ao acessar e usar o PigMoney ("Plataforma"), você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso. Se você não concordar com estes termos, por favor, não use nossos serviços.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">2. Descrição do Serviço</h2>
                                    <p>
                                        O PigMoney é uma ferramenta de gestão financeira projetada para simplificar sua vida financeira. Oferecemos recursos para rastreamento de despesas, controle de orçamento e visualização de dados financeiros. O serviço é fornecido "como está" e pode ser modificado ou descontinuado a qualquer momento.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">3. Cadastro e Conta</h2>
                                    <p>
                                        Para usar certos recursos, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades que ocorrem em sua conta. Informações precisas e completas são exigidas durante o registro.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">4. Privacidade de Dados</h2>
                                    <p>
                                        A sua privacidade é importante para nós. Nossa Política de Privacidade explica como coletamos, usamos e protegemos suas informações pessoais e financeiras. Ao usar o PigMoney, você concorda com nossas práticas de dados.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">5. Responsabilidades do Usuário</h2>
                                    <p>
                                        Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido tentar acessar dados de outros usuários, introduzir vírus ou interferir na operação do site.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitação de Responsabilidade</h2>
                                    <p>
                                        O PigMoney não se responsabiliza por decisões financeiras tomadas com base nas informações fornecidas pela plataforma. Embora nos esforcemos para garantir a precisão, não garantimos que os dados estejam livres de erros.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold text-foreground mb-3">7. Alterações nos Termos</h2>
                                    <p>
                                        Podemos revisar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso contínuo da plataforma após as alterações constitui aceitação dos novos termos.
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
