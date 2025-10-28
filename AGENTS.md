# Repository Guidelines

## Project Structure & Module Organization

Multi-language monorepo with npm workspaces:

```
ai-resume-toolkit/
├── packages/
│   ├── text-extractor/    # Python - PDF/DOCX parsing
│   ├── json-parser/        # TypeScript - LLM integration
│   └── scorer/             # TypeScript - Scoring algorithms
├── examples/               # Usage examples with ts-node
└── docs/                   # Architecture documentation
```

Each package is independently installable and usable.

## Build, Test, and Development Commands

```bash
# Root-level commands
npm run build          # Build all workspace packages
npm run type-check     # TypeScript type checking across workspaces
npm run clean          # Remove all dist directories

# Per-package setup
cd packages/text-extractor && pip install -e .
cd packages/json-parser && npm install && npm run build
cd packages/scorer && npm install && npm run build

# Run examples
npx ts-node examples/complete-workflow.ts
```

## Coding Style & Naming Conventions

**TypeScript:**
- Strict mode enabled with comprehensive type safety
- **Types/Interfaces:** PascalCase (`ParsedResume`, `ScoringConfig`, `LLMProvider`)
- **Functions/Variables:** camelCase (`scoreResume()`, `ratedData`, `getCappedFactor()`)
- **Files:** kebab-case (`resume-parser.ts`, `scoring-algorithms.ts`)
- Functional programming style for algorithms

**Python:**
- PEP 8 style guide strictly followed
- **Functions:** snake_case (`extract_resume_text()`, `process_pdf()`)
- **Files:** snake_case (`pdf_extractor.py`, `ocr_handler.py`)
- Type hints required for all public APIs

## Testing Guidelines

**Frameworks:**
- TypeScript packages: Vitest
- Python package: pytest

**Running Tests:**
```bash
cd packages/json-parser && npm test
cd packages/text-extractor && pytest
```

**Conventions:**
- Test files: `*.test.ts` or `test_*.py`
- Descriptive test names: `it('should extract text from PDF with fallback')`
- Mock external LLM calls in tests

## Commit & Pull Request Guidelines

**Commit Format:** Conventional Commits

```
feat(parser): add Anthropic Claude provider support
fix(extractor): handle corrupted PDF gracefully
docs(scorer): update algorithm mathematical analysis
chore: bump dependencies to latest versions
```

**Scopes:** `parser`, `extractor`, `scorer`, `docs`, `examples`

**PR Requirements:**
- Link related issues in description
- Update relevant package README.md
- Add/update tests for new functionality
- Ensure `npm run type-check` passes
- Document any breaking changes

## Environment Setup

**Required:**
- Node.js >= 18.0.0
- Python >= 3.8
- npm >= 9.0.0

**API Keys (for LLM features):**
- `OPENAI_API_KEY` for OpenAI provider
- `ANTHROPIC_API_KEY` for Anthropic provider

Store in `.env` files per package or use environment variables.
