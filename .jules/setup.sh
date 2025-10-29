#!/bin/bash
set -e

echo "🚀 Setting up AI Resume Toolkit..."

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python packages
echo "🐍 Installing Python text-extractor package..."
cd packages/text-extractor
pip install -e .
cd ../..

# Build TypeScript packages
echo "🔨 Building TypeScript packages..."
npm run build

# Type check
echo "✅ Running type check..."
npm run type-check

echo ""
echo "✅ AI Resume Toolkit setup complete!"
echo ""
echo "Next steps:"
echo "  - Set OPENAI_API_KEY environment variable for OpenAI parser"
echo "  - Set ANTHROPIC_API_KEY for Anthropic parser (optional)"
echo "  - Run examples: npx ts-node examples/complete-workflow.ts"
