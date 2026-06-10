# NexSaaS

# NexSaaS

<details open>
<summary>🇧🇷 Português</summary>

Boilerplate SaaS full-stack construído com Next.js 15, TypeScript, Prisma e Stripe. Inclui arquitetura multi-tenant, autenticação, billing com gerenciamento de assinaturas e controle de acesso baseado em planos.

![Dashboard](https://placehold.co/1200x630/f9fafb/111111?text=NexSaaS+Dashboard)

## ✨ Funcionalidades

- **Autenticação** — Cadastro, login, gerenciamento de sessão com JWT, atualização de senha
- **Multi-tenant** — Organizações com membros e papéis (Admin, Member, Viewer)
- **Billing** — Integração com Stripe: checkout, webhooks e portal do cliente
- **Controle por plano** — Acesso a funcionalidades baseado nos planos FREE / PRO / ENTERPRISE
- **Rotas protegidas** — Proteção de rotas no nível do middleware
- **Configurações** — Atualização de nome e senha com sincronização de sessão em tempo real

## 🛠 Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL (Docker) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 (Auth.js) |
| Pagamentos | Stripe |
| Validação | Zod |
| Estilização | Inline styles (zero dependências de UI) |
| Infra local | Docker Compose |

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # Handler do NextAuth
│   │   │   ├── register/        # Cadastro de usuário
│   │   │   └── settings/        # Atualizar nome e senha
│   │   ├── organizations/
│   │   │   ├── route.ts         # Criar organização
│   │   │   └── invite/          # Convidar membros
│   │   ├── billing/
│   │   │   ├── checkout/        # Sessão de checkout do Stripe
│   │   │   └── portal/          # Portal do cliente Stripe
│   │   └── webhooks/
│   │       └── stripe/          # Handler de webhooks do Stripe
│   ├── dashboard/
│   │   ├── layout.tsx           # Navegação lateral
│   │   ├── page.tsx             # Visão geral com org e plano
│   │   ├── billing/             # Planos e gerenciamento de assinatura
│   │   ├── organization/        # Detalhes da org e convite de membros
│   │   ├── features/            # Vitrine de funcionalidades por plano
│   │   └── settings/            # Configurações do usuário
│   ├── login/
│   ├── register/
│   ├── error.tsx                # Boundary de erro global
│   └── not-found.tsx            # Página 404 customizada
├── lib/
│   ├── auth.ts                  # Configuração do NextAuth
│   ├── prisma.ts                # Singleton do Prisma client
│   ├── stripe.ts                # Cliente do Stripe
│   └── plan.ts                  # Helpers de controle de acesso por plano
├── components/
│   ├── Providers.tsx            # Wrapper do SessionProvider
│   └── SignOutButton.tsx        # Logout client-side
prisma/
└── schema.prisma                # Schema do banco de dados
```

## 🏗 Decisões de Arquitetura

**Por que estratégia JWT com Prisma adapter?**
O app usa sessões JWT para auth stateless (sem hit no banco a cada requisição) enquanto ainda persiste contas OAuth e usuários via Prisma adapter. Isso combina o melhor dos dois mundos: performance e suporte a OAuth.

**Por que driver adapters no Prisma 7?**
O Prisma 7 migrou para uma arquitetura baseada em adapters, removendo a query engine em Rust em favor de drivers Node.js nativos. Usamos `@prisma/adapter-pg` com connection pool, o que é mais performático e adequado para produção.

**Por que inline styles em vez de um framework CSS?**
Este boilerplate é intencionalmente leve no lado de UI. Pode ser integrado em qualquer projeto e reestilizado com Tailwind, shadcn/ui ou qualquer outro sistema sem conflitos.

**Isolamento de dados multi-tenant**
Cada `Organization` tem seus próprios registros de `Membership` vinculando usuários com papéis. Todas as queries são escopadas por `organizationId`, garantindo isolamento de dados entre tenants no nível do ORM.

**Idempotência no webhook do Stripe**
O handler de webhook verifica a existência de `stripeSubscriptionId` antes de atualizar o plano da organização, evitando processamento duplicado do mesmo evento.

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta no Stripe (modo test)
- Stripe CLI (para testar webhooks localmente)

### 1. Clone o repositório

```bash
git clone https://github.com/yourusername/nextsaas.git
cd nextsaas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha os valores no `.env` — instruções de onde obter cada chave estão no próprio arquivo.

### 4. Suba o banco de dados

```bash
docker-compose up -d
```

### 5. Rode as migrations

```bash
npx prisma migrate dev
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 7. Escute os webhooks do Stripe (terminal separado)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o valor `whsec_...` e adicione no `.env` como `STRIPE_WEBHOOK_SECRET`.

O app estará disponível em [http://localhost:3000](http://localhost:3000).

## 💳 Testando Pagamentos

Use o cartão de teste do Stripe para simular pagamentos:

| Campo | Valor |
|---|---|
| Número do cartão | `4242 4242 4242 4242` |
| Validade | Qualquer data futura |
| CVC | Qualquer 3 dígitos |
| Nome | Qualquer nome |

## 🗄 Schema do Banco

```
User
 ├── Account (provedores OAuth)
 ├── Session
 └── Membership
       └── Organization
             ├── plan: FREE | PRO | ENTERPRISE
             ├── stripeCustomerId
             └── stripeSubscriptionId
```

## 🔐 Fluxo de Autenticação

1. Usuário se cadastra em `/register` → senha hasheada com bcrypt (custo 12)
2. Login em `/login` → credenciais validadas, JWT emitido
3. JWT armazenado em cookie HTTP-only, verificado em cada requisição via middleware
4. Sessão sincronizada no client via `SessionProvider` + `useSession`

## 💰 Fluxo de Billing

1. Usuário clica em "Assinar" → POST `/api/billing/checkout`
2. Sessão de Checkout do Stripe criada com `customer_email`
3. Usuário completa o pagamento na página hospedada do Stripe
4. Stripe dispara o webhook `checkout.session.completed`
5. Handler do webhook recupera a assinatura e mapeia o nome do produto para o enum de plano
6. Campo `plan` da organização atualizado no banco

## 🛡 Controle de Acesso

Rotas protegidas em dois níveis:

**Nível de middleware** (`src/middleware.ts`) — redireciona usuários não autenticados para fora de `/dashboard/*` e usuários autenticados para fora de `/login` e `/register`.

**Nível de plano** (`src/lib/plan.ts`) — `hasAccess(userPlan, requiredPlan)` compara a hierarquia de planos (FREE < PRO < ENTERPRISE) para liberar funcionalidades.

## 📦 Deploy em Produção

### Vercel + Railway

1. Faça push para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Crie um banco PostgreSQL no [Railway](https://railway.app)
4. Configure todas as variáveis de ambiente na Vercel (atualize `DATABASE_URL` com a URL do Railway e `NEXTAUTH_URL` com o domínio da Vercel)
5. No Stripe Dashboard → Developers → Webhooks, adicione a URL de produção: `https://seudominio.vercel.app/api/webhooks/stripe`
6. Atualize o `STRIPE_WEBHOOK_SECRET` na Vercel com o novo secret do webhook

## 📄 Licença

MIT

</details>

---

<details>
<summary>🇺🇸 English</summary>

Full-stack SaaS boilerplate built with Next.js 15, TypeScript, Prisma and Stripe. Includes multi-tenant architecture, authentication, billing with subscription management, and role-based access control.

## ✨ Features

- **Authentication** — Register, login, session management with JWT, password update
- **Multi-tenant** — Organizations with members and roles (Admin, Member, Viewer)
- **Billing** — Stripe integration with checkout, webhooks and customer portal
- **Plan-based access** — Feature access control based on FREE / PRO / ENTERPRISE plans
- **Protected routes** — Middleware-level route protection
- **Settings** — Update name and password with real-time session sync

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Docker) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 (Auth.js) |
| Payments | Stripe |
| Validation | Zod |
| Styling | Inline styles (zero UI dependencies) |
| Infra | Docker Compose |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   ├── register/        # User registration
│   │   │   └── settings/        # Update name and password
│   │   ├── organizations/
│   │   │   ├── route.ts         # Create organization
│   │   │   └── invite/          # Invite members
│   │   ├── billing/
│   │   │   ├── checkout/        # Stripe checkout session
│   │   │   └── portal/          # Stripe customer portal
│   │   └── webhooks/
│   │       └── stripe/          # Stripe webhook handler
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar navigation
│   │   ├── page.tsx             # Overview with org and plan
│   │   ├── billing/             # Plans and subscription management
│   │   ├── organization/        # Org details and member invite
│   │   ├── features/            # Plan-based feature showcase
│   │   └── settings/            # User settings
│   ├── login/
│   ├── register/
│   ├── error.tsx                # Global error boundary
│   └── not-found.tsx            # Custom 404
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── stripe.ts                # Stripe client
│   └── plan.ts                  # Plan access control helpers
├── components/
│   ├── Providers.tsx            # SessionProvider wrapper
│   └── SignOutButton.tsx        # Client-side logout
prisma/
└── schema.prisma                # Database schema
```

## 🏗 Architecture Decisions

**Why JWT strategy with Prisma adapter?**
The app uses JWT sessions for stateless auth (no DB hit on every request) while still persisting OAuth accounts and users via the Prisma adapter. This gives the best of both worlds: performance and OAuth support.

**Why driver adapters for Prisma 7?**
Prisma 7 moved to an adapter-based architecture, removing the Rust query engine in favor of native Node.js drivers. We use `@prisma/adapter-pg` with a connection pool, which is more performant and production-ready.

**Why inline styles instead of a CSS framework?**
This boilerplate is intentionally dependency-light on the UI side. It can be dropped into any project and restyled with Tailwind, shadcn/ui, or any other system without conflicts.

**Multi-tenant data isolation**
Each `Organization` has its own `Membership` records linking users with roles. All queries are scoped by `organizationId`, ensuring data isolation between tenants at the ORM level.

**Stripe webhook idempotency**
The webhook handler checks for existing `stripeSubscriptionId` before updating the organization plan, preventing duplicate processing of the same event.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Stripe account (test mode)
- Stripe CLI (for local webhook testing)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nextsaas.git
cd nextsaas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env` — instructions for each key are in the file.

### 4. Start the database

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

### 7. Listen for Stripe webhooks (separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` value and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

The app will be available at [http://localhost:3000](http://localhost:3000).

## 💳 Testing Payments

Use Stripe's test card to simulate payments:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| Name | Any name |

## 🗄 Database Schema

```
User
 ├── Account (OAuth providers)
 ├── Session
 └── Membership
       └── Organization
             ├── plan: FREE | PRO | ENTERPRISE
             ├── stripeCustomerId
             └── stripeSubscriptionId
```

## 🔐 Authentication Flow

1. User registers via `/register` → password hashed with bcrypt (cost 12)
2. Login via `/login` → credentials validated, JWT issued
3. JWT stored in HTTP-only cookie, verified on every request via middleware
4. Session synced client-side via `SessionProvider` + `useSession`

## 💰 Billing Flow

1. User clicks "Subscribe" → POST `/api/billing/checkout`
2. Stripe Checkout session created with `customer_email`
3. User completes payment on Stripe's hosted page
4. Stripe fires `checkout.session.completed` webhook
5. Webhook handler retrieves subscription, maps product name to plan enum
6. Organization `plan` updated in database

## 🛡 Access Control

Routes are protected at two levels:

**Middleware level** (`src/middleware.ts`) — redirects unauthenticated users away from `/dashboard/*` and authenticated users away from `/login` and `/register`.

**Plan level** (`src/lib/plan.ts`) — `hasAccess(userPlan, requiredPlan)` compares plan hierarchy (FREE < PRO < ENTERPRISE) to gate features.

## 📦 Production Deployment

### Vercel + Railway

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Create a PostgreSQL database on [Railway](https://railway.app)
4. Set all environment variables on Vercel (update `DATABASE_URL` to Railway's URL and `NEXTAUTH_URL` to your Vercel domain)
5. On Stripe Dashboard → Developers → Webhooks, add your production URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
6. Update `STRIPE_WEBHOOK_SECRET` on Vercel with the new webhook secret

## 📄 License

MIT

</details>


<details>
<summary>🇺🇸 English</summary>
Full-stack SaaS boilerplate built with Next.js 15, TypeScript, Prisma and Stripe. Includes multi-tenant architecture, authentication, billing with subscription management, and role-based access control.

![Dashboard](https://placehold.co/1200x630/f9fafb/111111?text=NexSaaS+Dashboard)

## ✨ Features

- **Authentication** — Register, login, session management with JWT, password update
- **Multi-tenant** — Organizations with members and roles (Admin, Member, Viewer)
- **Billing** — Stripe integration with checkout, webhooks and customer portal
- **Plan-based access** — Feature access control based on FREE / PRO / ENTERPRISE plans
- **Protected routes** — Middleware-level route protection
- **Settings** — Update name and password with real-time session sync

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Docker) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 (Auth.js) |
| Payments | Stripe |
| Validation | Zod |
| Styling | Inline styles (zero dependencies) |
| Infra | Docker Compose |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   ├── register/        # User registration
│   │   │   └── settings/        # Update name and password
│   │   ├── organizations/
│   │   │   ├── route.ts         # Create organization
│   │   │   └── invite/          # Invite members
│   │   ├── billing/
│   │   │   ├── checkout/        # Stripe checkout session
│   │   │   └── portal/          # Stripe customer portal
│   │   └── webhooks/
│   │       └── stripe/          # Stripe webhook handler
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar navigation
│   │   ├── page.tsx             # Overview with org and plan
│   │   ├── billing/             # Plans and subscription management
│   │   ├── organization/        # Org details and member invite
│   │   ├── features/            # Plan-based feature showcase
│   │   └── settings/            # User settings
│   ├── login/
│   ├── register/
│   ├── error.tsx                # Global error boundary
│   └── not-found.tsx            # Custom 404
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── stripe.ts                # Stripe client
│   └── plan.ts                  # Plan access control helpers
├── components/
│   ├── Providers.tsx            # SessionProvider wrapper
│   └── SignOutButton.tsx        # Client-side logout
prisma/
└── schema.prisma                # Database schema
```

## 🏗 Architecture Decisions

**Why JWT strategy with Prisma adapter?**
The app uses JWT sessions for stateless auth (no DB hit on every request) while still persisting OAuth accounts and users via the Prisma adapter. This gives the best of both worlds: performance and OAuth support.

**Why driver adapters for Prisma 7?**
Prisma 7 moved to an adapter-based architecture, removing the Rust query engine in favor of native Node.js drivers. We use `@prisma/adapter-pg` with a connection pool, which is more performant and production-ready.

**Why inline styles instead of a CSS framework?**
This boilerplate is intentionally dependency-light on the UI side. It can be dropped into any project and restyled with Tailwind, shadcn/ui, or any other system without conflicts.

**Multi-tenant data isolation**
Each `Organization` has its own `Membership` records linking users with roles. All queries are scoped by `organizationId`, ensuring data isolation between tenants at the ORM level.

**Stripe webhook idempotency**
The webhook handler checks for existing `stripeSubscriptionId` before updating the organization plan, preventing duplicate processing of the same event.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Stripe account (test mode)
- Stripe CLI (for local webhook testing)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nextsaas.git
cd nextsaas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env` — instructions for each key are in the file.

### 4. Start the database

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

### 7. Listen for Stripe webhooks (separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` value and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

The app will be available at [http://localhost:3000](http://localhost:3000).

## 💳 Testing Payments

Use Stripe's test card to simulate payments:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| Name | Any name |

## 🗄 Database Schema

```
User
 ├── Account (OAuth providers)
 ├── Session
 └── Membership
       └── Organization
             ├── plan: FREE | PRO | ENTERPRISE
             ├── stripeCustomerId
             └── stripeSubscriptionId
```

## 🔐 Authentication Flow

1. User registers via `/register` → password hashed with bcrypt (cost 12)
2. Login via `/login` → credentials validated, JWT issued
3. JWT stored in HTTP-only cookie, verified on every request via middleware
4. Session synced client-side via `SessionProvider` + `useSession`

## 💰 Billing Flow

1. User clicks "Subscribe" → POST `/api/billing/checkout`
2. Stripe Checkout session created with `customer_email`
3. User completes payment on Stripe's hosted page
4. Stripe fires `checkout.session.completed` webhook
5. Webhook handler retrieves subscription, maps product name to plan enum
6. Organization `plan` updated in database

## 🛡 Access Control

Routes are protected at two levels:

**Middleware level** (`src/middleware.ts`) — redirects unauthenticated users away from `/dashboard/*` and authenticated users away from `/login` and `/register`.

**Plan level** (`src/lib/plan.ts`) — `hasAccess(userPlan, requiredPlan)` compares plan hierarchy (FREE < PRO < ENTERPRISE) to gate features.

## 📦 Production Deployment

### Vercel + Railway

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Create a PostgreSQL database on [Railway](https://railway.app)
4. Set all environment variables on Vercel (update `DATABASE_URL` to Railway's URL and `NEXTAUTH_URL` to your Vercel domain)
5. On Stripe Dashboard → Developers → Webhooks, add your production URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
6. Update `STRIPE_WEBHOOK_SECRET` on Vercel with the new webhook secret

## 📄 License

MIT

</details>

