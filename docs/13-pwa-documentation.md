# 📱 PigMoney - PWA Documentation

> **Progressive Web App** | Dezembro 2025

---

## 1. Visão Geral

O PigMoney é um **Progressive Web App (PWA)** completo que permite:

- ✅ Instalação no dispositivo (Android/iOS)
- ✅ Ícone na tela inicial
- ✅ Tela cheia (sem barra do navegador)
- ✅ Splash screen nativo
- ✅ Cache inteligente para performance
- ✅ Página offline elegante
- ✅ Notificações de atualização

---

## 2. Arquivos PWA

| Arquivo | Localização | Função |
|---------|-------------|--------|
| `site.webmanifest` | `/public/` | Manifest com ícones e shortcuts |
| `offline.html` | `/public/` | Página exibida sem conexão |
| `sw.js` | `/dist/` (gerado) | Service Worker |
| `workbox-*.js` | `/dist/` (gerado) | Biblioteca de cache |
| `vite.config.ts` | `/` | Config do PWA plugin |
| `PWAUpdateNotification.tsx` | `/src/components/` | UI de atualização |
| `vite-pwa.d.ts` | `/src/` | Tipos TypeScript |

---

## 3. Manifest

```json
{
  "name": "PIGMONEY - Gestão Financeira",
  "short_name": "PIGMONEY",
  "display": "standalone",
  "theme_color": "#58CC02",
  "background_color": "#0a0a0a",
  "start_url": "/dashboard",
  "shortcuts": [
    { "name": "Dashboard", "url": "/dashboard" },
    { "name": "Adicionar Receita", "url": "/income" },
    { "name": "Adicionar Despesa", "url": "/expenses" }
  ]
}
```

---

## 4. Service Worker - Estratégias de Cache

### 4.1 Google Fonts
```
Estratégia: CacheFirst
Duração: 1 ano
Cache: google-fonts-cache
```

### 4.2 Imagens
```
Estratégia: CacheFirst
Duração: 30 dias
Cache: images-cache
Max: 100 entradas
```

### 4.3 API Supabase
```
Estratégia: NetworkFirst
Duração: 5 minutos
Cache: supabase-api-cache
Timeout: 10 segundos
```

### 4.4 Assets Estáticos
```
Estratégia: Precache
Padrão: **/*.{js,css,html,ico,png,svg,woff2}
```

---

## 5. Instalação no Dispositivo

### Android (Chrome)
1. Acesse pigmoney.com.br
2. Toque no menu (⋮)
3. "Instalar aplicativo" ou "Adicionar à tela inicial"
4. Confirme

### iOS (Safari)
1. Acesse pigmoney.com.br
2. Toque no ícone de compartilhar (↑)
3. "Adicionar à Tela de Início"
4. Confirme

---

## 6. Meta Tags iOS

```html
<!-- Habilita modo app -->
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- Status bar translúcida -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Nome do app -->
<meta name="apple-mobile-web-app-title" content="PIGMONEY" />

<!-- Ícones touch -->
<link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />

<!-- Splash screens por dispositivo -->
<link rel="apple-touch-startup-image" href="/favicon.png" 
      media="(device-width: 390px) and (device-height: 844px)" />
```

---

## 7. Atualização Automática

### Funcionamento
1. Vite PWA gera novo service worker em cada build
2. Componente `PWAUpdateNotification` detecta mudança
3. Modal aparece para usuário: "Nova versão disponível!"
4. Usuário clica "Atualizar Agora"
5. Service worker é substituído e página recarrega

### Código do Componente
```tsx
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    // Check for updates every 30 minutes
    setInterval(() => registration.update(), 30 * 60 * 1000);
  }
});
```

---

## 8. Página Offline

Quando sem conexão, o usuário vê:
- Logo animado do PigMoney
- Mensagem "Você está offline"
- Botão "Tentar Novamente"
- Auto-reconexão quando internet volta

---

## 9. Verificação e Debug

### Chrome DevTools
1. Abra DevTools (F12)
2. Aba "Application"
3. Seção "Service Workers" - status do SW
4. Seção "Manifest" - validação do manifest
5. Seção "Cache Storage" - caches ativos

### Lighthouse
1. DevTools → Lighthouse
2. Selecione "PWA"
3. Execute auditoria
4. Meta: 100 pontos PWA

---

## 10. Deploy no Vercel

### Requisitos
```
vercel.json não é necessário
Build command: npm run build
Output: dist/
```

### Headers importantes (auto-configurados)
```
Service-Worker-Allowed: /
Cache-Control: public, max-age=0, must-revalidate
```

---

## 11. Ícones Necessários

| Ícone | Tamanho | Uso |
|-------|---------|-----|
| `favicon.svg` | any | Todos os tamanhos |
| `favicon.png` | 363x363 | Apple Touch |
| `icon-192.png` | 192x192 | Android (criar) |
| `icon-512.png` | 512x512 | Splash (criar) |
| `icon-maskable.png` | 512x512 | Android adaptive (criar) |

> **Nota**: Atualmente usando favicon.svg/png. Para melhor compatibilidade, gerar ícones PNG específicos.

---

## 12. Checklist PWA

- [x] Manifest completo
- [x] Service Worker com Workbox
- [x] Estratégias de cache configuradas
- [x] Página offline estilizada
- [x] Meta tags iOS completas
- [x] Notificação de atualização
- [x] Display standalone
- [x] Theme color definido
- [x] Shortcuts configurados
- [ ] Ícones PNG específicos (opcional)
- [ ] Screenshots no manifest (opcional)

---

> **PigMoney PWA v1.0** | Dezembro 2025
