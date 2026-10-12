# Handoff Report: Milestone 1 (Project Initialization & Build Framework Strategy)

- **Agent**: Explorer M1 (Instance 1)
- **Working Directory**: `e:\ToolCart\.agents\teamwork\explorer_m1_1`
- **Target Project Root**: `e:\ToolCart`
- **Parent Conversation ID**: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`
- **Status**: Completed

---

## 1. Observation

Direct observations and evidence collected during filesystem inspection and command execution in `e:\ToolCart`:

### 1.1 Existing Filesystem Structure & Non-Code Assets
Directory listing of `e:\ToolCart` confirmed the presence of 12 subdirectories and 9 root files:
- Subdirectories: `.agents`, `architecture`, `assets`, `baseline`, `data`, `design`, `docs`, `handoff`, `prototype`, `qa`, `reference`, `schemas`.
- Root specification documents: `AGENTS.md`, `BRAND_V3_START_HERE.md`, `ORIGINAL_REQUEST.md`, `PROJECT.md`, `README.md`, `START_HERE_AGENT.md`, `TEST_INFRA.md`, `ToolCart_Final_Colour_Brand_Guide_V3.docx`.
- There is currently **no `package.json`**, **no `tsconfig.json`**, **no `node_modules`**, **no `app/`**, and **no `src/`** directory.
- `git status` output: `fatal: not a git repository (or any of the parent directories): .git`.

### 1.2 Host Environment Versions
Execution of system inspection commands:
- `node -v` -> `v22.20.0`
- `npm -v` -> `10.9.3`
- `python --version` -> `Python 3.12.10`
- `git --version` -> `git version 2.55.0.windows.5`

### 1.3 Static QA Script Failure (`qa/check_static.py`)
Executing `python qa\check_static.py` failed verbatim with:
```
Traceback (most recent call last):
  File "E:\ToolCart\qa\check_static.py", line 5, in <module>
    css=(root/'design/tokens.css').read_text()
  ...
FileNotFoundError: [Errno 2] No such file or directory: '\\mnt\\data\\toolcart_v3_work\\design\\tokens.css'
```
Inspecting `qa/check_static.py`:
- Line 4: `root=Path('/mnt/data/toolcart_v3_work')` (hardcoded Linux path).
- Lines 5, 6, 28: `.read_text()` without `encoding='utf-8'` (defaults to Windows `cp1252`, causing Unicode decode errors on special characters).
- Line 25: `if subprocess.call(['which','node'],stdout=subprocess.DEVNULL)==0:` (`which` command does not exist on Windows cmd/PowerShell).
- When tested with dynamic root `Path(__file__).resolve().parent.parent`, `encoding='utf-8'`, and `shutil.which('node')`, the script executes cleanly:
  `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix` (exit code 0).

### 1.4 Design Tokens & Typography Authority
- `design/tokens.css` defines root CSS variables:
  - `--tc-ink`: `#182336`
  - `--tc-primary`: `#2450B8` (Cobalt)
  - `--tc-primary-hover`: `#193F99` (Cobalt Deep)
  - `--tc-action-lime`: `#DDF16A` (Action Lime)
  - `--tc-lime-hover`: `#CFDE53`
  - `--tc-canvas`: `#F7F8F5` (Workshop White)
  - `--tc-chalk`: `#F7F5F1`
  - `--tc-surface`: `#FFFFFF`
  - `--tc-surface-soft`: `#EAF0FF` (Cloud Blue)
  - `--tc-blue-light`: `#D7EFFF`
  - `--tc-graphite`: `#252D30`
  - `--tc-text-secondary`: `#596B70` (Steel Text)
  - `--tc-steel-grey-on-white-only`: `#66767A`
  - `--tc-border`: `#D8E0E5`
  - `--tc-border-strong`: `#7C8A94`
  - `--tc-warning`: `#B45309`
  - `--tc-success`: `#176447`
  - `--tc-error`: `#B42318`
  - `--tc-focus`: `#2450B8`
  - `--font-heading`: `'Manrope', system-ui, sans-serif`
  - `--font-body`: `'IBM Plex Sans', system-ui, sans-serif`
  - `--radius-card`: `14px`
  - `--radius-button`: `10px`
- `design/tailwind_mapping.md` lines 7–16 define semantic inline theme variables:
  `--color-brand: var(--tc-primary);`, `--color-brand-hover: var(--tc-primary-hover);`, `--color-accent: var(--tc-action-lime);`, `--color-ink: var(--tc-ink);`, `--color-canvas: var(--tc-canvas);`, `--color-ai-surface: var(--tc-surface-soft);`, `--color-body-muted: var(--tc-text-secondary);`, `--color-functional-outline: var(--tc-border-strong);`.
- `qa/contrast_matrix.json` lines 123–153 specify 4 strictly prohibited ("do not use") combinations:
  - Lime alone on white (1.25:1)
  - Steel Grey on canvas (4.44:1)
  - Steel Grey on Cloud Blue (4.15:1)
  - White on Lime (1.25:1)

---

## 2. Logic Chain

1. **Conflict-Free Initialization Rationale**:
   - Running interactive CLI scaffolding commands like `npx create-next-app` directly inside `e:\ToolCart` will fail immediately because `create-next-app` refuses to execute in non-empty directories, or if forced with flags, risks overwriting existing critical files (`README.md`, existing folders).
   - Therefore, the initialization MUST be declarative: author `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, and `.gitignore` directly in the project root, followed by running `npm install`.
   - None of the target framework paths (`app/`, `src/`, `tests/`) conflict with existing workspace directories (`docs/`, `design/`, `schemas/`, `baseline/`, `qa/`, `architecture/`, `prototype/`, `data/`, `reference/`, `handoff/`).

2. **Dependency Harmonization Logic**:
   - `next@14.2.20` paired with `react@^18.3.1` and `react-dom@^18.3.1` is the proven LTS App Router framework that guarantees complete peer-dependency compatibility with `@radix-ui/*` primitives, `lucide-react`, and `tailwindcss-animate` on Node 22 without requiring `--legacy-peer-deps` or experimental shims.
   - UI primitives require `clsx`, `tailwind-merge`, and `class-variance-authority` (cva) for type-safe polymorphic component styling.
   - Testing infrastructure requires `vitest` (fast ESM/TypeScript runner), `@vitejs/plugin-react`, `vite-tsconfig-paths`, and `@testing-library/react` + `@testing-library/jest-dom` in `jsdom` environment.
   - Commerce and catalog utilities needed across M1–M3 (`zod` and `csv-parse`) should be present from Day 1 to avoid repeated dependency re-installations.

3. **TypeScript Path Resolution Logic**:
   - Next.js App Router organizes routing files under `app/` while UI primitives, lib modules, and types live under `src/`.
   - TypeScript `compilerOptions.paths` supports array fallback definitions: `"@/*": ["./src/*", "./app/*"]`.
   - To avoid any ambiguity and accelerate language server lookups, explicit subpath aliases (`@/components/*`, `@/lib/*`, `@/types/*`, `@/app/*`) must be defined alongside the wildcard alias.
   - Excludes must explicitly include `node_modules`, `prototype`, `baseline`, and `.agents` to prevent TypeScript from attempting to typecheck raw prototype scripts or agent working files.

4. **Tailwind CSS & Token Architecture Logic**:
   - `design/tokens.css` is the single authoritative source of truth.
   - By importing `../design/tokens.css` inside `app/globals.css` and mapping each Tailwind color utility to `var(--tc-*)`, all components automatically inherit the Brand V3 palette.
   - Fonts are loaded via `next/font/google` (`Manrope` with weights 600–800, and `IBM_Plex_Sans` with weights 400–700) and assigned to CSS variables `--font-heading` and `--font-body` on `<html className="...">`. This guarantees zero layout shift, self-hosted font delivery, and compliance with the rule that font binaries must not be committed to the repo.
   - Tabular numerals (`tabular-nums`) are enforced on spec sheets and pricing elements via utility classes.
   - Action Lime controls are configured with an explicit 2px Ink outline (`border-2 border-tc-ink`) and Ink text (`text-tc-ink`), guaranteeing WCAG AA compliance (12.66:1 contrast ratio) and preventing the prohibited white-on-lime pairing (1.25:1).

5. **Cross-Platform Script Fix Logic**:
   - `qa/check_static.py` is an M1 required deliverable (Feature 5). Fixing the path resolution to `Path(__file__).resolve().parent.parent`, using `encoding='utf-8'`, and replacing `which` with `shutil.which('node')` allows the test to execute identically on Windows and Linux, passing all assertions with exit code 0.

---

## 3. Caveats

- **Network Dependency for `npm install`**: `npm install` requires internet access to fetch packages from the npm registry. The host environment Node (v22.20.0) and npm (10.9.3) are healthy, and network connectivity is active.
- **Git Repository State**: The project root is currently not a git repository (`.git` is absent). While this does not prevent npm or Next.js from building, initializing git (`git init`) is recommended during M1 implementation to allow clean commit tracking.
- **Google Fonts Offline Fallback**: In restricted or air-gapped CI environments, `next/font/google` falls back to the system sans-serif fonts declared in `tokens.css` (`'Manrope', system-ui, sans-serif` and `'IBM Plex Sans', system-ui, sans-serif`).

---

## 4. Conclusion & Actionable Implementation Blueprints

The implementation strategy for Milestone 1 is completely designed. Below are the exact file manifests for immediate declarative implementation by the builder agent.

### 4.1 Declarative File Manifests

#### Manifest 1: `package.json`
```json
{
  "name": "toolcart-uk",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:qa": "python qa/check_static.py",
    "test:all": "vitest run && python qa/check_static.py"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.693.0",
    "@aws-sdk/s3-request-presigner": "^3.693.0",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@stripe/react-stripe-js": "^2.8.1",
    "@stripe/stripe-js": "^4.9.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.46.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "csv-parse": "^5.5.6",
    "lucide-react": "^0.460.0",
    "next": "14.2.20",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "resend": "^4.0.1",
    "stripe": "^17.3.1",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.17.6",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite-tsconfig-paths": "^5.1.3",
    "vitest": "^2.1.5"
  }
}
```

#### Manifest 2: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*", "./app/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "prototype",
    "baseline",
    ".agents"
  ]
}
```

#### Manifest 3: `tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tc-ink': 'var(--tc-ink)',
        'tc-primary': 'var(--tc-primary)',
        'tc-primary-hover': 'var(--tc-primary-hover)',
        'tc-action-lime': 'var(--tc-action-lime)',
        'tc-lime-hover': 'var(--tc-lime-hover)',
        'tc-canvas': 'var(--tc-canvas)',
        'tc-chalk': 'var(--tc-chalk)',
        'tc-surface': 'var(--tc-surface)',
        'tc-surface-soft': 'var(--tc-surface-soft)',
        'tc-blue-light': 'var(--tc-blue-light)',
        'tc-graphite': 'var(--tc-graphite)',
        'tc-text-secondary': 'var(--tc-text-secondary)',
        'tc-steel-grey': 'var(--tc-steel-grey-on-white-only)',
        'tc-border': 'var(--tc-border)',
        'tc-border-strong': 'var(--tc-border-strong)',
        'tc-warning': 'var(--tc-warning)',
        'tc-success': 'var(--tc-success)',
        'tc-error': 'var(--tc-error)',
        'tc-focus': 'var(--tc-focus)',

        // Semantic Brand V3 Aliases
        brand: {
          DEFAULT: 'var(--tc-primary)',
          hover: 'var(--tc-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--tc-action-lime)',
          hover: 'var(--tc-lime-hover)',
        },
        ink: 'var(--tc-ink)',
        canvas: 'var(--tc-canvas)',
        'ai-surface': 'var(--tc-surface-soft)',
        'body-muted': 'var(--tc-text-secondary)',
        'functional-outline': 'var(--tc-border-strong)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card, 14px)',
        button: 'var(--radius-button, 10px)',
      },
      boxShadow: {
        'lime-outline': '0 0 0 2px var(--tc-ink)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
```

#### Manifest 4: `postcss.config.mjs`
```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

#### Manifest 5: `app/globals.css`
```css
@import "../design/tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--tc-canvas);
    color: var(--tc-graphite);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--tc-ink);
    font-weight: 700;
  }
}

@layer utilities {
  /* Action Lime accent button with strict 2px Ink outline */
  .tc-btn-accent {
    background-color: var(--tc-action-lime);
    color: var(--tc-ink);
    border: 2px solid var(--tc-ink);
    border-radius: var(--radius-button);
  }
  .tc-btn-accent:hover {
    background-color: var(--tc-lime-hover);
  }

  /* Tabular numbers for specs, prices, and SKUs */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

#### Manifest 6: `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Manrope, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ToolCart UK | Industrial Hardware & Tools',
  description: 'Supplier-backed UK tools, DIY, and hardware e-commerce platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen bg-tc-canvas font-body text-tc-graphite antialiased">
        {children}
      </body>
    </html>
  );
}
```

#### Manifest 7: `src/lib/utils.ts`
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Manifest 8: `src/components/ui/button.tsx`
```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-tc-primary text-white border-2 border-tc-primary hover:bg-tc-primary-hover hover:border-tc-primary-hover',
        accent:
          'bg-tc-action-lime text-tc-ink border-2 border-tc-ink hover:bg-tc-lime-hover shadow-sm',
        secondary:
          'bg-tc-surface text-tc-ink border-2 border-tc-border-strong hover:bg-tc-canvas',
        ghost:
          'text-tc-ink hover:bg-tc-surface-soft',
        outline:
          'border-2 border-tc-border-strong bg-transparent text-tc-ink hover:bg-tc-surface-soft',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Manifest 9: `vitest.config.ts` & `tests/setup.ts`
`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
});
```
`tests/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

#### Manifest 10: `qa/check_static.py` (Cross-Platform Patch for Feature 5)
```python
from pathlib import Path
import json, re, shutil, subprocess, sys
from bs4 import BeautifulSoup

# Dynamic root resolution (independent of OS or folder mount)
root = Path(__file__).resolve().parent.parent

css = (root / 'design/tokens.css').read_text(encoding='utf-8')
proto = (root / 'prototype/index.html').read_text(encoding='utf-8')

assert '#B84C32' not in css and '#B84C32' not in proto
assert '--tc-copper' not in css and '--tc-copper' not in proto
assert 'Worksite Cobalt + Copper' not in proto
assert '#DDF16A' in css and '#2450B8' in css
assert '#F7F8F5' in css
assert 'ToolCart' in proto

properties = set(re.findall(r'--tc-[\w-]+(?=\s*:)', css + '\n' + proto))
refs = set(re.findall(r'var\((--tc-[\w-]+)', proto))
missing = refs - properties
assert not missing, f'missing CSS vars: {missing}'

soup = BeautifulSoup(proto, 'html.parser')
assert len(soup.select('button[data-category]')) >= 4
assert soup.select_one('#productGrid')
assert soup.select_one('#main-search')
assert soup.select_one('title')

scripts = [tag.string for tag in soup.select('script') if tag.string]
js = '\n'.join(scripts)
file = root / 'qa/prototype_inline.js'
file.write_text(js, encoding='utf-8')

if shutil.which('node') is not None:
    r = subprocess.run(['node', '--check', str(file)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr

results = json.loads((root / 'qa/contrast_matrix.json').read_text(encoding='utf-8'))
for item in results:
    if 'do not use' in item['use'].lower():
        assert not item['pass_wcag'], item
    else:
        assert item['pass_wcag'], item

print('PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix')
print('browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified')
```

---

## 5. Verification Method

Once the implementer applies the manifests above, the following independent verification sequence must be executed to validate Milestone 1:

1. **Verify No Overwrites of Non-Code Directories**:
   - Check that `docs/`, `design/`, `schemas/`, `baseline/`, `qa/`, `architecture/`, `prototype/` all remain intact.
2. **Execute Package Installation**:
   - Run `npm install` in `e:\ToolCart`.
   - Verify exit code 0 and generation of `package-lock.json` and `node_modules/`.
3. **Execute TypeScript Typechecking**:
   - Run `npm run typecheck` (`tsc --noEmit`).
   - Verify exit code 0.
4. **Execute Next.js Linter**:
   - Run `npm run lint` (`next lint`).
   - Verify exit code 0.
5. **Execute Next.js Production Build**:
   - Run `npm run build` (`next build`).
   - Verify exit code 0 with compiled `.next` outputs.
6. **Execute Vitest Automated Test Suite**:
   - Run `npm test` (`vitest run`).
   - Verify exit code 0.
7. **Execute Patched QA Static Suite**:
   - Run `python qa/check_static.py`.
   - Verify output: `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix` with exit code 0.
8. **Invalidation Conditions**:
   - Any occurrence of `#B84C32` or `--tc-copper` in new code files.
   - Any pairing of Action Lime with white text (`text-white bg-tc-action-lime`).
   - `tsc` or `next build` failure due to missing path resolution for `@/*`.
