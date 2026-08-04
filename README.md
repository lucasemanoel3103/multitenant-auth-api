# nest-postgres-boilerplate

Boilerplate para APIs backend, extraído da estrutura do projeto **gateway-pagamento**.
Stack: **NestJS 11 + Prisma 7 (adapter `pg`) + PostgreSQL (Docker) + ESLint/Prettier + Jest**.

Objetivo: zerar o tempo de "configurar ambiente" e começar a codar em minutos.

## Stack e padrões incluídos

- NestJS com `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`)
- Filtro global de exceções (`AllExceptionsFilter`) — padroniza o formato de erro de toda a API
- Prisma com `@prisma/adapter-pg`, `PrismaService` global (`onModuleInit`/`onModuleDestroy`)
- PostgreSQL via `docker-compose.yml`, variáveis em `.env`
- ESLint (flat config, `typescript-eslint` recommendedTypeChecked) + Prettier integrados
- Jest configurado para unit tests (`*.spec.ts`) e e2e (`test/*.e2e-spec.ts`)
- `PaginationQueryDto` genérico em `src/common/dto` pra reaproveitar em qualquer módulo
- Módulo de exemplo `items` (`src/example`) com CRUD completo (controller, service, DTOs,
  paginação, teste unitário) — serve de molde: copie a pasta, renomeie e ajuste o `schema.prisma`.

## Como usar num projeto novo

**Opção A — Template repo no GitHub (recomendado):**
1. Suba este boilerplate como um repositório no GitHub.
2. Nas configurações do repo, marque **"Template repository"**.
3. Pra cada novo projeto, clique em **"Use this template"** → já nasce um repo limpo, sem
   histórico de commits do boilerplate.

**Opção B — clonar direto:**
```bash
git clone <url-do-boilerplate> nome-do-projeto-novo
cd nome-do-projeto-novo
rm -rf .git && git init
```

## Primeiro uso

```bash
npm run bootstrap
```

Isso executa `scripts/setup.sh`, que:
1. Cria o `.env` a partir do `.env.example` (se não existir)
2. Instala as dependências (`npm install`)
3. Sobe o PostgreSQL via Docker
4. Espera o banco ficar pronto
5. Gera o Prisma client e roda a migration inicial

Depois é só:
```bash
npm run start:dev
```

API sobe em `http://localhost:3000`, com um health check em `GET /health`.

## Adaptando pro seu domínio

1. Apague/renomeie o módulo `src/example` (é só um molde).
2. Edite `prisma/schema.prisma` com seus models reais.
3. Rode `npx prisma migrate dev --name <nome-da-mudanca>` pra gerar a migration.
4. Crie seus módulos seguindo o mesmo padrão de camadas: `module` → `controller` → `service`
   → `dto/`.
5. Atualize `name` e `description` no `package.json`.

## Scripts úteis

| Comando                  | O que faz                              |
| ------------------------- | --------------------------------------- |
| `npm run start:dev`       | sobe a API em modo watch                |
| `npm run lint`             | roda ESLint com `--fix`                 |
| `npm run test` / `test:e2e`| roda testes unitários / e2e            |
| `npm run prisma:studio`    | abre o Prisma Studio (GUI do banco)     |
| `npm run prisma:migrate`   | cria/aplica uma nova migration          |

## Estrutura

```
src/
  common/
    dto/pagination-query.dto.ts
    filters/all-exceptions.filter.ts
  example/            # módulo-molde (CRUD completo) — renomeie ou apague
  prisma/
    prisma.module.ts
    prisma.service.ts
  app.module.ts
  app.controller.ts
  app.service.ts
  main.ts
prisma/
  schema.prisma
test/
  app.e2e-spec.ts
scripts/
  setup.sh
docker-compose.yml
.env.example
```
