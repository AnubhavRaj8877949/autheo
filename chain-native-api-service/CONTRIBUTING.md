# Contributing

## Project Structure

```
src/
├── constant/       # Enums, status codes, and static message maps (no logic)
├── environments/   # Environment loading, interface definitions, and validation
├── interfaces/     # TypeScript interfaces and types (no runtime logic)
├── libs/           # Utility functions and third-party client wrappers
│   └── utilities/  # Pure helper functions (validation, formatting, sanitization)
├── modules/        # Feature modules — one folder per domain
│   ├── block/
│   ├── contract/
│   ├── delegator/
│   ├── explorer/
│   ├── proposal/
│   ├── token/
│   ├── transactions/
│   └── validator/
├── services/       # Infrastructure services — Redis, RabbitMQ, and response helpers
├── routes.ts       # Central route registration
├── app.ts          # Express app setup and middleware wiring
└── server.ts       # Entry point — boots services and starts the HTTP server
```

### Rules

- **`constant/`** — values, enums, and message strings only; no functions, no imports from other `src/` folders.
- **`interfaces/`** — TypeScript types and interfaces only; no runtime logic.
- **`libs/`** — pure utility functions or singleton wrappers for external clients (CosmJS RPC, APR calculation). Must not contain domain business logic.
- **`modules/`** — each domain folder owns its controller, service, and validation. Business logic for a domain lives here, not in `services/`.
- **`services/`** — infrastructure concerns only (Redis client, RabbitMQ connection, response formatting). Do not add domain logic here.
- **`routes.ts`** — registration wiring only; no inline handlers.

---

## Dependency Policy

- Prefer packages already used in this repo before adding a new one.
- Pin new dependencies to a specific minor version range (e.g. `^1.2.0`) — avoid open ranges like `*` or `>=`.
- Run `npm audit` before opening a PR. Do not merge with high or critical advisories unresolved.
- Before adding a new package, answer the following in the PR description:
  1. **What does this package do?** Describe the specific functionality being added.
  2. **Why is no existing dependency sufficient?** Check current packages in `package.json` first.
  3. **Is the usage narrow?** If the required logic is simple and only used in one or two places, implement it yourself in `src/libs/` instead of pulling in an external package.

---

## Environment Variables

- Every new environment variable must be added to both `.env.example` (with a comment) and `.env`.
- Required variables must be declared in `src/environments/environment.ts` inside the `Environment` class constructor — never read `process.env` directly outside of that class.
- Add required variable names to the `REQUIRED_ENV_VARS` array in `environment.ts` to ensure startup validation fails fast on missing config.

---

## Error Handling

- Every `catch` block must call `logger.error(...)` before returning or rethrowing.
- Internal errors must never expose `err.message`, `err.stack`, or internal state to the HTTP response.
- All unhandled exceptions are caught by the global handler in `App.errorHandler()` and respond with `RESPONSES.INTERNAL_SERVER` and `RES_MSG.INTERNAL_SERVER_ERROR` from `src/constant/index.ts`.
- Do not use nested `try/catch` as control flow.

---

## Code Style

- All linting and formatting is enforced via ESLint and Prettier. Run `npm run lint-fix && npm run pretty` before committing.
- Pre-commit and pre-push hooks run automatically via Husky — do not bypass them with `--no-verify`.
- Do not hardcode strings, status codes, or numeric constants inline. Add them to `src/constant/index.ts`.
- HTTP status codes must always use `RESPONSES.*`, never raw numbers.
- Response messages must always use `RES_MSG.*`, never inline strings.
- Use `logger` from `src/libs/logger.ts` for all logging. Never use `console.log` or `console.error`.
- Never log raw connection URLs. Use `sanitizeUrl()` from `src/libs/utilities/common.ts` to strip credentials before logging.
- Service singletons are exported as camelCase from `src/services/index.ts` (`redisService`, `rabbitMqService`, `responseHelper`). Import them by that exact name.

---

## Pull Request Guidelines

- One concern per PR — do not mix feature work with refactoring or dependency updates.
- PR title must be concise (under 70 characters) and use a prefix: `feat:`, `fix:`, `chore:`, `refactor:`, or `docs:`.
- Include a short description of what changed and why.
- All CI checks must pass before requesting a review.
