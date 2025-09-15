## Hono E-commerce API

### Installation

To install dependencies:

```sh
bun install
```

### Environment Setup

Copy the environment variables and update with your values:

```sh
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Resend email service API key
- `SENTRY_ENABLED` - Enable/disable Sentry error monitoring
- `SENTRY_DSN` - Sentry project DSN (if Sentry is enabled)

### Running the Application

To run in development mode:

```sh
bun run dev
```

To build for production:

```sh
bun run build
```

To run production build:

```sh
bun run start
```

### API Documentation

The server runs on http://localhost:9999 (or your configured PORT)

- API Base: `http://localhost:9999/api`
- API Documentation: `http://localhost:9999/api/reference`

### Error Monitoring with Sentry

This project includes integrated Sentry support for error monitoring, performance tracking, and logging.

To enable Sentry:

1. Set `SENTRY_ENABLED=true` in your `.env` file
2. Add your `SENTRY_DSN` from your Sentry project
3. Optionally configure sampling rates and other options

For detailed setup instructions, see: `src/lib/core/SENTRY_SETUP.md`

### Database

Generate migrations:

```sh
bun run db:generate
```

Run migrations:

```sh
bun run db:migrate
```

Push schema directly (development):

```sh
bun run db:push
```

Open Drizzle Studio:

```sh
bun run db:studio
```
