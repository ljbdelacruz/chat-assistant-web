# Chat Assistant Web

A modern chat assistant web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 Built with Next.js 14 App Router
- 💎 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🌙 Dark/Light theme support
- 📱 Responsive design
- ⚡ Fast and optimized
- 🧹 ESLint and Prettier configured
- 🔧 Path aliases configured

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat-assistant-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── chat/             # Chat-related components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Customization

### Adding New Components

Create components in the `src/components` directory with proper TypeScript types:

```tsx
// src/components/example/MyComponent.tsx
interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>
}
```

### Styling

This project uses Tailwind CSS with a custom design system. Colors and other design tokens are defined in:
- `tailwind.config.ts` - Tailwind configuration
- `src/app/globals.css` - CSS custom properties for themes

### API Integration

To integrate with an AI service:

1. Add your API credentials to `.env.local`
2. Create API routes in `src/app/api/`
3. Update the chat hook in `src/hooks/useChat.ts`

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
