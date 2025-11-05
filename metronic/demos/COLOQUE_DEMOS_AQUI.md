# 📥 Coloque as Demos do Metronic Aqui

Esta pasta deve conter as demos do **Metronic 9 React** que você comprou em:
https://keenthemes.com/metronic

---

## 📁 Estrutura Esperada

```
metronic/demos/
├── demo1/                                       ← Demo 1 completo
│   ├── src/
│   │   ├── _metronic/
│   │   ├── app/
│   │   ├── assets/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── ...
│
├── demo2/                                       ← Demo 2 completo (opcional)
│   ├── src/
│   ├── package.json
│   └── ...
│
└── demo3/                                       ← Demo 3 completo (opcional)
    ├── src/
    ├── package.json
    └── ...
```

---

## 🚀 Como Adicionar

### 1. Compre o Metronic 9 React

https://keenthemes.com/metronic

### 2. Baixe e Extraia

Após a compra, baixe o pacote e extraia.

### 3. Copie as Demos

```bash
# Linux/Mac
cp -r /caminho/para/metronic-react/demo1 ./demo1
cp -r /caminho/para/metronic-react/demo2 ./demo2

# Windows PowerShell
Copy-Item -Recurse "C:\Downloads\metronic-react\demo1" .\demo1
Copy-Item -Recurse "C:\Downloads\metronic-react\demo2" .\demo2
```

### 4. Commit e Push

```bash
cd ../../..  # Voltar para raiz do repositório Lotus
git add metronic/demos/
git commit -m "feat: Add Metronic React demos"
git push
```

### 5. Execute Sofia AI

```powershell
# Sofia vai detectar automaticamente e processar
.\Sofia-Metronic-Manager.ps1
```

---

## 📝 Observações

- **Mínimo:** 1 demo (demo1)
- **Recomendado:** 2-3 demos para Sofia escolher os melhores componentes
- **Máximo:** Todas as demos disponíveis no Metronic

Quanto mais demos você adicionar, mais opções Sofia terá para escolher os melhores componentes!

---

## ✅ Checklist

- [ ] Metronic 9 React comprado
- [ ] Demos baixadas e extraídas
- [ ] Demo(s) copiada(s) para esta pasta
- [ ] Estrutura de pastas preservada (src/, package.json, etc.)
- [ ] Commit e push realizado
- [ ] Sofia-Metronic-Manager executado

---

**Após adicionar as demos, delete este arquivo! 😊**
