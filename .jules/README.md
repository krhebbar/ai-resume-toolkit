# Jules Environment Setup - AI Resume Toolkit

## Setup Script

The setup script (`setup.sh`) will:
1. Install Node.js dependencies for all workspace packages
2. Install Python text-extractor package in editable mode
3. Build all TypeScript packages
4. Run type checking to verify setup

## Environment Variables

### Required

None for basic functionality. The toolkit works without API keys for text extraction.

### Optional (for LLM Features)

| Variable | Description | Used By |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-3.5/4 parsing | json-parser with OpenAI provider |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude parsing | json-parser with Anthropic provider |

### Configuration in Jules

When creating a Jules session:

1. **For text extraction only:** No environment variables needed
2. **For OpenAI parsing:** Enable `OPENAI_API_KEY`
3. **For Anthropic parsing:** Enable `ANTHROPIC_API_KEY`

## Usage Examples

After setup, you can run:

```bash
# Extract text from PDF
cd packages/text-extractor
python examples/extract_example.py

# Parse resume with OpenAI (requires OPENAI_API_KEY)
cd packages/json-parser
npm run example

# Score resume
cd packages/scorer
npm run example
```

## Tech Stack

- **Languages:** Python 3.8+, TypeScript 5.3+, Node.js 18+
- **Monorepo:** npm workspaces
- **Build:** TypeScript compiler (tsc)
- **Key Dependencies:** date-fns, openai, anthropic, pdfminer.six, pypdf

## Package Structure

- `packages/text-extractor/` - Python PDF/DOCX parser
- `packages/json-parser/` - TypeScript LLM integration
- `packages/scorer/` - TypeScript scoring algorithms
