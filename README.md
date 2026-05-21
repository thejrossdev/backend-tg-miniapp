# Backend for Telegram Mini app

## Documentation

- [Working with Migrations](/docs/migrations.md)

---

## 🌟 Key Features

- `NestJS (v11)` backend with TypeORM & PostgreSQL
- `NextJS (v15)` frontend with SSR & Micro-Frontend support
- `SWC` for fast TypeScript and JavaScript transpilation
- `JWT` Authentication (Access & Refresh Tokens)
- `PostgreSQL` database with TypeORM
- `Nodemailer` for email services
- `Turborepo` for efficient caching and task orchestration
- `Shadcn/UI` & `Tailwindcss(v4)` integration
- Pre-configured linting, formatting, and Git hooks

---

## Useful commands

**Generate secrets (e.g., `TELEGRAM_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`)**

```bash
make gen-secret
```

or

```bash
openssl rand -hex 32
```

---
**Convert dependency graph from `mermaid` to `svg`**  
_Need installed [mermaid-cli](https://github.com/mermaid-js/mermaid-cli)_

```bash
make gen-deps
```

or

```bash
mmdc -i ./docs/assets/deps.mermaid -o ./docs/assets/deps.svg
```

---
**Generate the API Client for Fetch or Axios from an OpenAPI Specification**

```bash
make gen-api
```

or

```bash
pnpm swagger-typescript-api generate -p http://localhost:3000/api-json -o ./src/generated -n api.generated.ts --extract-enums
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.
