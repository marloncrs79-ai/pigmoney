# Fluxo de Atualização: Do Código ao Site

Seu entendimento está **quase 100% correto**! Falta apenas um pequeno "click" entre o seu computador e o GitHub.

Aqui está o passo a passo exato do que acontece:

```mermaid
graph TD
    A[Você/IA] -->|1. Faz Alterações| B(Seu Computador\n"Changes")
    B -->|2. Autoriza/Commit| C(Cofre Local\n"Source Control")
    C -->|3. Sincronizar/Push| D{GitHub\n"Nuvem"}
    D -->|4. Detecta Mudança| E(Vercel\n"Deploy Automático")
    E -->|5. Publica| F[Site no Ar\n"PIGMONEY"]
```

## Passo a Passo Detalhado

1.  **Edição (Você/Eu)**: Nós mexemos no código.
    *   *Estado:* As mudanças aparecem como "Pendentes" na aba de Controle de Código-Fonte.
2.  **Autorizar (Commit)**: É o que acabamos de fazer. Você diz "ok, essas mudanças estão boas, salve uma versão disso".
    *   *Estado:* As mudanças estão salvas **apenas no seu computador**. O GitHub e a Vercel ainda não sabem delas.
3.  **Sincronizar (Push) - O Passo Extra**:
    *   Depois de fazer o Commit, geralmente aparece um botão **"Sync Changes"** ou **"Push"** (uma setinha para cima) no VS Code.
    *   **É esse botão que envia o seu "Save" do computador para a nuvem (GitHub).**
4.  **GitHub**: Recebe os arquivos novos.
5.  **Vercel**: A Vercel fica "espiando" o GitHub. Assim que ela vê que chegou código novo, ela começa a construir o site (Build) e atualiza o endereço oficial automaticamente.

**Resumo:**
Para o site atualizar, você precisa: **Commitar (Autorizar)** -> **Sincronizar (Enviar)**.
