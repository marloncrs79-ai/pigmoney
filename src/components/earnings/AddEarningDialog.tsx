import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEarnings } from "@/hooks/useEarnings";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available or use-toast

interface AddEarningDialogProps {
    trigger?: React.ReactNode;
}

export function AddEarningDialog({ trigger }: AddEarningDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("freelance");
    const { addEarning } = useEarnings();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        try {
            await addEarning.mutateAsync({
                amount: parseFloat(amount.replace(",", ".")), // Handle comma decimal
                description,
                category,
            });
            toast.success("Ganho registrado com sucesso!");
            setOpen(false);
            setAmount("");
            setDescription("");
            setCategory("freelance");
        } catch (error) {
            toast.error("Erro ao registrar ganho");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg transform transition hover:scale-[1.02]">
                        <Plus className="mr-2 h-5 w-5" />
                        CADASTRAR GANHO
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Novo Ganho 💰</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor Recebido</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                            <Input
                                id="amount"
                                placeholder="0,00"
                                className="pl-9 text-lg font-semibold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                step="0.01"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="freelance">Freelance</SelectItem>
                                <SelectItem value="delivery">Entregas / App</SelectItem>
                                <SelectItem value="venda">Venda</SelectItem>
                                <SelectItem value="servico">Serviço</SelectItem>
                                <SelectItem value="extra">Renda Extra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Entrega Ifood"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={addEarning.isPending}>
                        {addEarning.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Salvar Ganho"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
