# 💻 Getting Started - Primeiro Desenvolvimento

> **Do ambiente local ao primeiro feature em 30 minutos**

---

## 🎯 Objetivo

Este guia irá levá-lo através do processo de:
1. ✅ Setup do ambiente de desenvolvimento
2. ✅ Estrutura do projeto
3. ✅ Primeiro feature: adicionar novo endpoint à Sofia AI
4. ✅ Testes
5. ✅ Commit e PR

---

## 📋 Pré-requisitos

```bash
# Verificar instalações
node --version    # v22.0.0+
pnpm --version    # v8.0.0+
docker --version  # 24.0.0+
git --version     # 2.40.0+
```

Se não tiver `pnpm`:
```bash
npm install -g pnpm
```

---

## 🏗️ Estrutura do Projeto

```
Lotus/
├── backend/
│   ├── sofia-ai/          ← Sofia AI v3.0 (TypeScript)
│   │   ├── src/
│   │   │   ├── core/      ← Core components
│   │   │   ├── layers/    ← Cognitive Mesh layers
│   │   │   ├── integrations/
│   │   │   ├── validators/
│   │   │   ├── optimizers/
│   │   │   └── marketplace/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/               ← Backend API (em desenvolvimento)
├── frontend/
│   └── admin/             ← Admin frontend (em desenvolvimento)
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   └── monitoring/
│   ├── kubernetes/
│   └── terraform/
├── docs/                  ← Esta documentação
├── .env.example
├── package.json           ← Monorepo root
├── turbo.json             ← Turbo config
└── README.md
```

---

## 🚀 Setup do Ambiente

### **1. Clone e Instale**

```bash
# Clone
git clone https://github.com/netbarros/Lotus.git
cd Lotus

# Instale dependências (monorepo)
pnpm install
```

### **2. Configure .env**

```bash
# Copie o exemplo
cp .env.example .env

# Edite com suas credenciais
nano .env
```

**Variáveis OBRIGATÓRIAS**:
```env
# Sofia AI
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3003

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_KEY=your-directus-key
DIRECTUS_SECRET=your-directus-secret
DIRECTUS_ADMIN_EMAIL=admin@softwarelotus.com.br
DIRECTUS_ADMIN_PASSWORD=YourSecurePassword123!

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/magicsaas
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **3. Suba a Infraestrutura**

```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up -d
```

Aguarde todos os serviços ficarem healthy (~2 min):
```bash
docker ps
```

### **4. Rode Sofia AI em Dev Mode**

```bash
cd backend/sofia-ai
pnpm dev
```

Sofia AI iniciará em http://localhost:3003 com hot reload ativado.

---

## 🔧 Primeiro Feature: Adicionar Endpoint "Hello World"

Vamos adicionar um endpoint simples para entender o fluxo.

### **1. Criar o Endpoint**

Edite `backend/sofia-ai/src/index.ts`:

```typescript
// ... imports existentes ...

// Após as rotas existentes, adicione:

/**
 * Hello World endpoint - Exemplo de feature nova
 */
app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'World';

  res.json({
    success: true,
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    sofia: 'is alive 🌸'
  });
});
```

### **2. Salve e Teste**

O hot reload vai reiniciar automaticamente. Teste:

```bash
curl http://localhost:3003/api/hello
# { "success": true, "message": "Hello, World!", ... }

curl http://localhost:3003/api/hello?name=Sofia
# { "success": true, "message": "Hello, Sofia!", ... }
```

✅ **Feature funcionando!**

---

## 🧪 Adicionar Testes

### **1. Criar Arquivo de Teste**

Crie `backend/sofia-ai/tests/api/hello.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, server } from '../../src/index';

describe('GET /api/hello', () => {
  afterAll(() => {
    server.close();
  });

  it('should return hello world', async () => {
    const response = await request(app)
      .get('/api/hello')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Hello, World!',
      sofia: 'is alive 🌸'
    });
  });

  it('should greet with custom name', async () => {
    const response = await request(app)
      .get('/api/hello?name=Sofia')
      .expect(200);

    expect(response.body.message).toBe('Hello, Sofia!');
  });

  it('should include timestamp and version', async () => {
    const response = await request(app)
      .get('/api/hello')
      .expect(200);

    expect(response.body.timestamp).toBeDefined();
    expect(response.body.version).toBe('3.0.0');
  });
});
```

### **2. Rodar Testes**

```bash
cd backend/sofia-ai
pnpm test
```

Resultado esperado:
```
✓ GET /api/hello (3)
  ✓ should return hello world
  ✓ should greet with custom name
  ✓ should include timestamp and version

Test Files  1 passed (1)
Tests  3 passed (3)
```

---

## 📝 Documentar o Endpoint

Adicione ao README ou crie documentação:

```markdown
### GET /api/hello

Endpoint de exemplo para demonstração.

**Query Parameters:**
- `name` (opcional): Nome para cumprimentar. Default: "World"

**Response:**
```json
{
  "success": true,
  "message": "Hello, Sofia!",
  "timestamp": "2025-11-05T10:30:00Z",
  "version": "3.0.0",
  "sofia": "is alive 🌸"
}
```
```

---

## 🔄 Git Workflow

### **1. Criar Branch**

```bash
git checkout -b feature/add-hello-endpoint
```

### **2. Commit**

```bash
git add backend/sofia-ai/src/index.ts
git add backend/sofia-ai/tests/api/hello.test.ts

git commit -m "feat: add /api/hello endpoint

- Add GET /api/hello endpoint with optional name parameter
- Add 3 unit tests with 100% coverage
- Update API documentation

Closes #123"
```

### **3. Push**

```bash
git push -u origin feature/add-hello-endpoint
```

### **4. Criar Pull Request**

```bash
# Se tiver gh CLI instalado
gh pr create --title "feat: add /api/hello endpoint" \
  --body "## Summary
- Adds new GET /api/hello endpoint
- Includes 3 unit tests
- Documentation updated

## Testing
\`\`\`bash
curl http://localhost:3003/api/hello
curl http://localhost:3003/api/hello?name=Sofia
\`\`\`

## Checklist
- [x] Tests pass
- [x] Documentation updated
- [x] No linting errors
"
```

---

## 🎯 Feature Mais Complexo: Adicionar Validação de Email

Agora vamos criar algo mais real.

### **1. Criar Validador**

Crie `backend/sofia-ai/src/validators/EmailValidator.ts`:

```typescript
import { logger } from '../utils/logger.js';

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Valida formato de email
   */
  static validate(email: string): {
    valid: boolean;
    error?: string;
    suggestions?: string[];
  } {
    if (!email) {
      return {
        valid: false,
        error: 'Email is required'
      };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format',
        suggestions: this.getSuggestions(email)
      };
    }

    // Validações adicionais
    const domain = email.split('@')[1];

    if (domain && this.isDisposableEmail(domain)) {
      return {
        valid: false,
        error: 'Disposable emails are not allowed',
        suggestions: ['gmail.com', 'outlook.com', 'yahoo.com']
      };
    }

    logger.info('Email validated successfully', { email });

    return { valid: true };
  }

  /**
   * Verifica se é email descartável
   */
  private static isDisposableEmail(domain: string): boolean {
    const disposableDomains = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com'
    ];
    return disposableDomains.includes(domain.toLowerCase());
  }

  /**
   * Sugestões de correção
   */
  private static getSuggestions(email: string): string[] {
    const suggestions: string[] = [];

    // Detectar erros comuns
    if (email.includes('gmai.com')) {
      suggestions.push(email.replace('gmai.com', 'gmail.com'));
    }
    if (email.includes('hotmai.com')) {
      suggestions.push(email.replace('hotmai.com', 'hotmail.com'));
    }

    return suggestions;
  }
}
```

### **2. Criar Endpoint**

Em `backend/sofia-ai/src/index.ts`:

```typescript
import { EmailValidator } from './validators/EmailValidator.js';

app.post('/api/validate/email', (req, res) => {
  const { email } = req.body;

  const result = EmailValidator.validate(email);

  res.json({
    success: result.valid,
    ...result
  });
});
```

### **3. Criar Testes**

Crie `backend/sofia-ai/tests/validators/EmailValidator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { EmailValidator } from '../../src/validators/EmailValidator';

describe('EmailValidator', () => {
  describe('valid emails', () => {
    it('should validate correct email', () => {
      const result = EmailValidator.validate('user@example.com');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it('should reject empty email', () => {
      const result = EmailValidator.validate('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject invalid format', () => {
      const result = EmailValidator.validate('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject disposable emails', () => {
      const result = EmailValidator.validate('test@tempmail.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Disposable');
    });
  });

  describe('suggestions', () => {
    it('should suggest gmail correction', () => {
      const result = EmailValidator.validate('user@gmai.com');
      expect(result.suggestions).toContain('user@gmail.com');
    });
  });
});
```

### **4. Testar**

```bash
# Rodar testes
pnpm test

# Testar endpoint
curl -X POST http://localhost:3003/api/validate/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmai.com"}'

# Response:
{
  "success": false,
  "valid": false,
  "error": "Invalid email format",
  "suggestions": ["user@gmail.com"]
}
```

---

## 🐛 Debugging

### **VS Code Launch Configuration**

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Sofia AI",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/backend/sofia-ai",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### **Breakpoints**

1. Abra o arquivo em VS Code
2. Clique na margem esquerda (número da linha) para adicionar breakpoint
3. Pressione F5 para iniciar debug
4. Faça request ao endpoint
5. VS Code vai parar no breakpoint

---

## 📊 Métricas e Logs

### **Ver Logs Estruturados**

```bash
# Logs do Sofia AI
docker logs -f magicsaas-sofia-ai

# Filtrar por nível
docker logs magicsaas-sofia-ai 2>&1 | grep "error"
```

### **Prometheus Metrics**

Acesse http://localhost:9090 e rode queries:

```promql
# Requests por segundo
rate(sofia_http_requests_total[1m])

# Latência p95
histogram_quantile(0.95, sofia_request_duration_seconds)

# Taxa de erro
rate(sofia_http_requests_total{status=~"5.."}[5m])
```

---

## 🎓 Próximos Passos

1. ✅ [Leia Coding Standards](./coding-standards.md)
2. ✅ [Entenda o Git Workflow](./git-workflow.md)
3. ✅ [Aprenda Testing Avançado](./testing.md)
4. ✅ [Configure seu Editor](./dev-environment.md)
5. ✅ [Explore a API Reference](../05-api-reference/sofia-ai-api.md)

---

**[← Voltar ao Índice](../00-INDEX.md)** | **[Próximo: Coding Standards →](./coding-standards.md)**
