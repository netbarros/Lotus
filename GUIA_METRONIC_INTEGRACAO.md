# 🎨 Guia de Integração do Metronic 9 com MagicSaaS

**Versão:** 1.0
**Data:** 2025-11-05
**Autor:** Sofia Lotus AI

---

## 📋 Pré-requisitos

### 1. Execute o Instalador DEFINITIVO

```powershell
# USE SOMENTE ESTE INSTALADOR:
.\Install-MagicSaaS-Enterprise-DEFINITIVE.ps1
```

**❌ NÃO USE os outros instaladores:**
- ❌ `scripts/Install-MagicSaaS-Enterprise.ps1` (versão antiga)
- ❌ `Install-MagicSaaS-Complete.ps1` (versão antiga)
- ❌ `Install-MagicSaaS-MEGA.ps1` (framework demo)

### 2. Compre o Metronic 9

- **Site:** https://keenthemes.com/metronic
- **Versão necessária:** Metronic 9 - React Version
- **Preço:** $49 (Regular) ou $499 (Extended License)
- **O que baixar:** Demo 1 (React + TypeScript)

---

## 🗂️ Estrutura Criada pelo Instalador

Quando você executa o instalador DEFINITIVO, ele cria:

```
C:\MagicSaaS/                                    ← Diretório raiz
├── frontend/
│   ├── admin/                                   ← Frontend Admin (ESTRUTURA)
│   │   ├── src/
│   │   │   ├── components/                      ← Componentes customizados (vazio)
│   │   │   ├── pages/                           ← Páginas (vazio)
│   │   │   ├── services/                        ← API integration (vazio)
│   │   │   ├── stores/                          ← Zustand stores (vazio)
│   │   │   └── types/                           ← TypeScript types (vazio)
│   │   ├── package.json                         ← Configuração base
│   │   └── README.md                            ← Instruções
│   └── widgets/                                 ← Widgets reutilizáveis
├── backend/                                     ← Backend API (COMPLETO)
├── mobile-sdk/                                  ← Mobile SDKs (COMPLETO)
├── blockchain/                                  ← Smart contracts (COMPLETO)
└── ...
```

**IMPORTANTE:** O instalador cria a **ESTRUTURA** do frontend, mas o Metronic precisa ser adicionado manualmente porque é um produto pago.

---

## 📥 Passo a Passo - Integração do Metronic

### Passo 1: Baixar o Metronic

1. Compre o Metronic em https://keenthemes.com/metronic
2. Faça login na sua conta
3. Baixe o pacote: **Metronic 9 - React TypeScript**
4. Extraia o arquivo ZIP

Você terá uma estrutura assim:
```
metronic-v9.0.0-react/
├── demo1/                                       ← USE ESTE
├── demo2/
├── demo3/
└── ...
```

### Passo 2: Preparar o Ambiente

```powershell
# Navegue até o diretório do MagicSaaS
cd C:\MagicSaaS\frontend\admin

# Faça backup da estrutura gerada (opcional, mas recomendado)
Copy-Item -Recurse -Path . -Destination ..\admin-backup
```

### Passo 3: Método de Integração

Você tem **2 opções**:

---

## 🎯 OPÇÃO 1: Copiar Componentes do Metronic (Recomendado)

Esta opção mantém a estrutura do MagicSaaS e adiciona os componentes do Metronic.

### 3.1. Copiar Pasta `_metronic`

```powershell
# Do pacote do Metronic, copie a pasta _metronic
# Origem: metronic-v9.0.0-react\demo1\src\_metronic\
# Destino: C:\MagicSaaS\frontend\admin\src\_metronic\

Copy-Item -Recurse "C:\Downloads\metronic-v9.0.0-react\demo1\src\_metronic" "C:\MagicSaaS\frontend\admin\src\"
```

### 3.2. Copiar Assets

```powershell
# Copiar assets (CSS, images, fonts)
Copy-Item -Recurse "C:\Downloads\metronic-v9.0.0-react\demo1\src\assets" "C:\MagicSaaS\frontend\admin\src\"
```

### 3.3. Copiar Arquivos de Configuração

```powershell
# Copiar arquivos de configuração do Metronic
Copy-Item "C:\Downloads\metronic-v9.0.0-react\demo1\tailwind.config.js" "C:\MagicSaaS\frontend\admin\"
Copy-Item "C:\Downloads\metronic-v9.0.0-react\demo1\tsconfig.json" "C:\MagicSaaS\frontend\admin\"
Copy-Item "C:\Downloads\metronic-v9.0.0-react\demo1\vite.config.ts" "C:\MagicSaaS\frontend\admin\"
```

### 3.4. Mesclar package.json

Abra `C:\MagicSaaS\frontend\admin\package.json` e adicione as dependências do Metronic:

```json
{
  "name": "magicsaas-admin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "@tanstack/react-query": "^5.59.16",
    "zustand": "^5.0.0",
    "axios": "^1.7.7",
    "clsx": "^2.1.1",

    // ADICIONE AS DEPENDÊNCIAS DO METRONIC:
    "apexcharts": "^3.54.0",
    "react-apexcharts": "^1.4.1",
    "bootstrap": "5.3.3",
    "prism-react-renderer": "^2.4.0",
    "prismjs": "^1.29.0",
    "react-bootstrap": "^2.10.5",
    "sass": "^1.79.4",
    "formik": "^2.4.6",
    "yup": "^1.4.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "eslint": "^9.13.0",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.14",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

### 3.5. Instalar Dependências

```powershell
cd C:\MagicSaaS\frontend\admin
pnpm install
```

### 3.6. Criar Estrutura de Páginas

Crie o arquivo `src/App.tsx`:

```typescript
import { FC } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MasterLayout } from './_metronic/layout/MasterLayout'
import { Dashboard } from './pages/Dashboard'
import { Tenants } from './pages/Tenants'
import { Users } from './pages/Users'
import { Billing } from './pages/Billing'

const queryClient = new QueryClient()

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MasterLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/users" element={<Users />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

### 3.7. Estrutura Final

```
C:\MagicSaaS\frontend\admin/
├── src/
│   ├── _metronic/                               ← DO METRONIC (copiado)
│   │   ├── layout/
│   │   │   ├── MasterLayout.tsx
│   │   │   ├── components/
│   │   │   └── core/
│   │   ├── partials/
│   │   ├── helpers/
│   │   └── assets/
│   ├── assets/                                  ← DO METRONIC (copiado)
│   │   ├── sass/
│   │   ├── ts/
│   │   └── media/
│   ├── pages/                                   ← SUAS PÁGINAS (criar)
│   │   ├── Dashboard.tsx
│   │   ├── Tenants.tsx
│   │   ├── Users.tsx
│   │   ├── Billing.tsx
│   │   └── ...
│   ├── components/                              ← SEUS COMPONENTES (criar)
│   │   ├── TenantCard.tsx
│   │   ├── UserTable.tsx
│   │   └── ...
│   ├── services/                                ← API INTEGRATION (criar)
│   │   ├── api.ts
│   │   ├── tenants.service.ts
│   │   ├── users.service.ts
│   │   └── ...
│   ├── stores/                                  ← ZUSTAND STORES (criar)
│   │   ├── authStore.ts
│   │   ├── tenantStore.ts
│   │   └── ...
│   ├── App.tsx                                  ← CRIAR
│   └── main.tsx                                 ← CRIAR
├── public/
├── index.html
├── package.json                                 ← MESCLAR
├── tsconfig.json                                ← DO METRONIC
├── vite.config.ts                               ← DO METRONIC
└── tailwind.config.js                           ← DO METRONIC
```

---

## 🎯 OPÇÃO 2: Usar Demo Completo do Metronic

Esta opção substitui toda a estrutura do frontend pelo demo do Metronic.

### 2.1. Backup da Estrutura Original

```powershell
# Renomear a pasta gerada pelo instalador
Rename-Item "C:\MagicSaaS\frontend\admin" "C:\MagicSaaS\frontend\admin-original"
```

### 2.2. Copiar Demo do Metronic

```powershell
# Copiar o demo1 do Metronic
Copy-Item -Recurse "C:\Downloads\metronic-v9.0.0-react\demo1" "C:\MagicSaaS\frontend\admin"
```

### 2.3. Instalar Dependências

```powershell
cd C:\MagicSaaS\frontend\admin
pnpm install
```

### 2.4. Customizar para MagicSaaS

Agora você precisa criar as páginas específicas do MagicSaaS dentro do demo do Metronic:

```
C:\MagicSaaS\frontend\admin/
├── src/
│   ├── app/                                     ← ADICIONAR SUAS PÁGINAS AQUI
│   │   ├── modules/
│   │   │   ├── dashboard/
│   │   │   ├── tenants/
│   │   │   ├── users/
│   │   │   ├── billing/
│   │   │   ├── workflows/
│   │   │   ├── marketplace/
│   │   │   └── ...
│   │   └── routing/
│   │       └── AppRoutes.tsx
│   ├── _metronic/                               ← JÁ VEM DO DEMO
│   └── ...
```

---

## 🚀 Iniciar o Frontend

Após a integração:

```powershell
cd C:\MagicSaaS\frontend\admin

# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview
```

O frontend estará disponível em: **http://localhost:5173**

---

## 🔗 Conectar com Backend

### Configurar API Base URL

Crie o arquivo `src/services/api.ts`:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### Criar Arquivo .env

Crie `C:\MagicSaaS\frontend\admin\.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=MagicSaaS System-∞
VITE_APP_VERSION=∞.2026.1.0
```

---

## 📚 Estrutura de Módulos Recomendada

### Dashboard Module

`src/app/modules/dashboard/DashboardPage.tsx`:
```typescript
import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'

export const DashboardPage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Dashboard</PageTitle>
      <div className="row g-5 g-xl-10">
        {/* Seus componentes de dashboard */}
      </div>
    </>
  )
}
```

### Tenants Module

`src/app/modules/tenants/TenantsPage.tsx`:
```typescript
import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import { TenantsTable } from './components/TenantsTable'

export const TenantsPage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Tenants', path: '/tenants' }]}>
        Gerenciar Tenants
      </PageTitle>
      <TenantsTable />
    </>
  )
}
```

---

## ✅ Checklist de Integração

- [ ] Instalador DEFINITIVO executado
- [ ] Metronic 9 comprado e baixado
- [ ] Pasta `_metronic` copiada
- [ ] Assets copiados
- [ ] package.json mesclado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Arquivo App.tsx criado
- [ ] Arquivo main.tsx criado
- [ ] Serviço de API configurado
- [ ] Arquivo .env criado
- [ ] Frontend iniciado com `pnpm dev`
- [ ] Conectado com backend (porta 3000)

---

## 🐛 Troubleshooting

### Erro: "Module not found: _metronic"

**Solução:** Você não copiou a pasta `_metronic` do Metronic.

```powershell
Copy-Item -Recurse "C:\Downloads\metronic-v9.0.0-react\demo1\src\_metronic" "C:\MagicSaaS\frontend\admin\src\"
```

### Erro: "Cannot find module 'sass'"

**Solução:** Instale as dependências do Metronic.

```powershell
cd C:\MagicSaaS\frontend\admin
pnpm add sass bootstrap react-bootstrap -D
```

### Frontend não conecta com Backend

**Solução:** Verifique se o backend está rodando.

```powershell
# Em outro terminal, inicie o backend
cd C:\MagicSaaS\backend\api
pnpm dev
```

### Estilos não carregam

**Solução:** Importe os estilos no `main.tsx`:

```typescript
import './_metronic/assets/sass/style.scss'
import './_metronic/assets/sass/plugins.scss'
import './_metronic/assets/sass/style.react.scss'
```

---

## 📞 Suporte

Se tiver problemas com a integração:

- **Email:** support@softwarelotus.com.br
- **Documentação Metronic:** https://preview.keenthemes.com/metronic8/react/docs/

---

## 🎉 Conclusão

Após seguir este guia, você terá:

✅ Frontend Admin com Metronic 9 integrado
✅ Estrutura de componentes organizados
✅ Conexão com backend API
✅ Ambiente de desenvolvimento pronto

**Próximo passo:** Começar a criar as páginas específicas do MagicSaaS usando os componentes do Metronic!

---

**Built with ❤️ by Sofia Lotus AI**
