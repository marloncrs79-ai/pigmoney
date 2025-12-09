# Relatório de Correção: Notificações (Toasts)

## Problema Original
Ao criar um cofrinho, o usuário via o texto "undefined" no toast de sucesso e a notificação não desaparecia automaticamente.

## Causa Raiz
1.  **Texto "undefined"**: O componente `Toaster.tsx` convertia o campo `description` para string (`String(description)`). Quando a descrição não era fornecida (undefined), isso resultava na string literal "undefined".
2.  **Falta de Auto-Close**: O PIGMONEY utiliza um componente customizado `PigNotify` para renderizar os toasts, ignorando a implementação padrão do Radix UI. O `PigNotify` não possuía lógica interna de timer para chamar a função de fechar.

## Correções Implementadas

1.  **Hook `useCreatePiggyBank` (e outros)**:
    - Adicionada `description` explícita em todas as chamadas de toast (ex: "Seu novo cofrinho foi criado com sucesso."). Isso garante uma mensagem amigável.

2.  **Componente `Toaster.tsx`**:
    - Adicionada verificação segura: `message={description ? ... : ""}`. Se a descrição for undefined, agora renderiza uma string vazia em vez de "undefined".

3.  **Componente `PigNotify.tsx`**:
    - Adicionada prop `duration` (padrão: 4000ms).
    - Implementado `useEffect` com `setTimeout` para invocar `onClose` automaticamente após a duração, garantindo que o toast desapareça.
    - Mantida a animação de entrada e saída.

## Resultado Final
- **Mensagem**: "Cofrinho criado com sucesso!" (Título) + "Seu novo cofrinho foi criado com sucesso." (Descrição).
- **Comportamento**: O toast aparece com animação e desaparece sozinho após 4 segundos.
- **Visual**: Mantido o estilo premium com mascote e cores do tema.

O fluxo de criação de cofrinhos agora está 100% corrigido e polido.
