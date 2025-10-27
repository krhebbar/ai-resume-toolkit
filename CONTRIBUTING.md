# Contributing to AI Resume Toolkit

Thank you for your interest in contributing to AI Resume Toolkit! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with a clear title and description
3. **Include details:**
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, Node/Python version)
   - Code examples or screenshots if applicable

### Submitting Pull Requests

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Keep commits focused and atomic

3. **Test your changes:**
   ```bash
   # TypeScript packages
   cd packages/json-parser
   npm run type-check
   npm run build

   # Python package
   cd packages/text-extractor
   python -m pytest tests/
   ```

4. **Submit your PR:**
   - Write a clear PR title and description
   - Reference related issues
   - Explain your changes and rationale
   - Include screenshots/examples if applicable

## 📋 Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **npm** >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/krhebber/ai-resume-toolkit.git
cd ai-resume-toolkit

# Install TypeScript dependencies
npm install

# Install Python dependencies
cd packages/text-extractor
pip install -e ".[dev]"
```

### Project Structure

```
ai-resume-toolkit/
├── packages/
│   ├── text-extractor/     # Python package
│   ├── json-parser/        # TypeScript package
│   └── scorer/             # TypeScript package
├── examples/               # Working examples
└── docs/                   # Documentation
```

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority

1. **Additional LLM Providers**
   - Gemini integration
   - Local LLM support (Ollama, LM Studio)
   - Azure OpenAI support

2. **Enhanced Scoring Algorithms**
   - Semantic skill matching using embeddings
   - Industry-specific scoring models
   - Bias detection and mitigation

3. **Additional File Formats**
   - RTF support
   - HTML resume parsing
   - Markdown resume support

### Medium Priority

4. **Performance Optimizations**
   - Parallel processing for batch operations
   - Caching layer implementation
   - Memory usage optimization

5. **Testing**
   - Unit tests for all packages
   - Integration tests
   - Performance benchmarks

6. **Documentation**
   - More examples and tutorials
   - Video guides
   - API documentation improvements

### Lower Priority

7. **Tooling**
   - CLI tool for resume processing
   - Web demo UI
   - VS Code extension

## 📝 Code Style Guidelines

### TypeScript

- Use **strict mode** (`tsconfig.json` with `"strict": true`)
- Follow existing code patterns
- Use **meaningful variable names**
- Add **JSDoc comments** for public APIs
- Use **interfaces** over `any` types

Example:
```typescript
/**
 * Calculate logarithmic score for non-linear scaling
 *
 * @param score - Raw score (0-100)
 * @returns Logarithmically scaled score (0-100)
 */
export function getLogarithmicScore(score: number): number {
  if (score < 1) score = 1;
  return 100 * (Math.log(score) / Math.log(100));
}
```

### Python

- Follow **PEP 8** style guide
- Use **type hints** (Python 3.8+)
- Add **docstrings** for classes and functions
- Use **meaningful variable names**

Example:
```python
def clean_text(text: str) -> str:
    """
    Clean extracted text by normalizing whitespace.

    Args:
        text: Raw extracted text

    Returns:
        Cleaned text with normalized whitespace
    """
    cleaned = re.sub(r'[\r\n]+|\s+', ' ', text)
    return cleaned.strip()
```

## 🧪 Testing Guidelines

### TypeScript Tests

```typescript
// Use descriptive test names
describe('getLogarithmicScore', () => {
  it('should return 0 for score of 1', () => {
    expect(getLogarithmicScore(1)).toBe(0);
  });

  it('should return 100 for score of 100', () => {
    expect(getLogarithmicScore(100)).toBe(100);
  });
});
```

### Python Tests

```python
def test_clean_text():
    """Test text cleaning removes extra whitespace"""
    input_text = "Hello\n\n  World  \t\n"
    expected = "Hello World"
    assert clean_text(input_text) == expected
```

## 📄 Documentation Guidelines

- Update README files when adding features
- Add code examples for new APIs
- Document breaking changes clearly
- Include migration guides for breaking changes

## 🔒 Security

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email security concerns to: [Your security email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues for similar questions

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Maintained by:** Ravindra Kanchikare (krhebber)
**License:** MIT
