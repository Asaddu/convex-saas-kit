# WorkOS TanStack Kit

A production-ready template for building SaaS applications with [Convex](https://convex.dev), [TanStack](https://tanstack.com), and [WorkOS](https://workos.com) authentication. This template provides everything you need to start building a modern SaaS application with:

- 🔐 **Authentication**: SSO, OAuth, and passwordless auth with WorkOS
- 🏢 **Organizations**: Multi-tenant support with WorkOS Organizations
- 💰 **Payments**: Subscription and billing with Stripe
- 🚀 **Serverless Backend**: Full-stack reactivity with Convex
- 📊 **Data Fetching**: Efficient querying with TanStack Query
- 🧭 **Routing**: Type-safe routing with TanStack Router
- 🎨 **Styling**: Beautiful UI with Tailwind CSS

## Features

- Complete authentication flow with WorkOS (Google, GitHub, Microsoft)
- Organization management
- User profiles and settings
- Responsive design
- Optimized for development and production
- Built with pnpm for faster, more reliable dependency management

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/installation) (v8 or higher)
- [Convex](https://docs.convex.dev/quickstart) account
- [WorkOS](https://workos.com/) account
- [Stripe](https://stripe.com/) account (optional, for payments)

### Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/workos-tanstack-kit.git
cd workos-tanstack-kit
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory:

```
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-id # Get this from Convex dashboard
VITE_CONVEX_URL=https://your-deployment-id.convex.cloud # Get this from Convex dashboard

# WorkOS
WORKOS_API_KEY=your_workos_api_key
NEXT_PUBLIC_WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_WEBHOOK_SECRET=your_workos_webhook_secret

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Set up WorkOS webhook:

- Go to the WorkOS Dashboard > Webhooks
- Create a new webhook endpoint pointing to `https://your-convex-url/workos-webhook`
- Copy the signing secret to your `.env.local` file

5. Start the development server:

```bash
pnpm run dev
```

## Development

The project uses Convex for the backend and Vite for the frontend. 

- `pnpm run dev` - Starts both the frontend and backend servers concurrently
- `pnpm run build` - Builds the application for production
- `pnpm run lint` - Runs the linter
- `pnpm run typecheck` - Checks types

## Deployment

To deploy your application:

1. Deploy your Convex backend:

```bash
npx convex deploy
```

2. Build and deploy your frontend using your preferred hosting service (Netlify, Vercel, etc.):

```bash
pnpm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
