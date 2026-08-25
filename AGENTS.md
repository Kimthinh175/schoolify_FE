# AGENTS.md - Guidelines for AI Coding Assistants

Refer to `.cursorrules` for full project guidelines, tech stack details, and coding conventions.

## Tech Stack Quick Summary
- **Framework**: Next.js App Router (TypeScript)
- **Styling & UI**: Tailwind CSS, `shadcn/ui` pattern (`src/components/ui/`), `lucide-react`
- **Animation**: `framer-motion`
- **Forms**: `react-hook-form` + `zod`
- **Class Merger**: `cn()` in `@/lib/utils`

Please follow these conventions when writing code for Schoolify FE.

## General UI Rules
- **Brand Consistency**: Always adhere strictly to the project's brand identity.
- **Responsive by Default**: UI must support mobile and tablet out of the box (Mobile-first Tailwind approach).
