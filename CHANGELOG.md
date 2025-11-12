# Changelog

All notable changes to the AI Resume Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Text Extractor Package** - Multi-format resume text extraction with intelligent OCR fallback
  - 3-tier PDF extraction strategy (pdfminer.six, pypdf, PyMuPDF)
  - Support for PDF, DOCX, and plain text formats
  - Automatic image extraction for scanned PDFs
  - Configurable OCR threshold (default: 500 characters)

- **JSON Parser Package** - LLM-based structured data extraction
  - Multi-provider support (OpenAI, Anthropic)
  - Type-safe schemas with Zod validation
  - Custom provider interface for extensibility
  - Token tracking for cost optimization
  - Convenience functions for quick parsing

- **Scorer Package** - Sophisticated resume scoring algorithms
  - Logarithmic scoring for quality over quantity
  - Capped factor algorithm to prevent keyword stuffing
  - Configurable category weights (education, experience, skills)
  - Adjustable rFactor for diminishing returns tuning
  - Zero-dependency pure TypeScript implementation

- **Documentation**
  - Comprehensive README with quick start guide
  - Detailed architecture documentation with mathematical analysis
  - Algorithm design rationale and trade-offs
  - Package-specific documentation
  - Mermaid diagrams for visual clarity

- **Testing Infrastructure**
  - Unit tests for core algorithms
  - Integration tests for LLM providers
  - Test fixtures and examples

### Changed
- Converted ASCII diagrams to Mermaid diagrams for better rendering
- Clarified experimental status of the project

### Implementation Status

**Text Extractor** ✅
- Core extraction logic implemented
- Multi-tier fallback strategy working
- Error handling comprehensive
- Type hints complete

**JSON Parser** ✅
- OpenAI provider fully functional
- Anthropic provider fully functional
- Zod schema validation working
- Custom provider interface defined

**Scorer** ✅
- Logarithmic score algorithm implemented
- Capped factor algorithm implemented
- Weighted aggregation working
- Type definitions complete

**Examples & Documentation** ✅
- Complete workflow examples
- API documentation
- Architecture documentation
- Mathematical analysis

---

## Project Status

This is an **experimental open-source project** extracted from production experience but provided as-is for educational and research purposes. The algorithms and approaches have been battle-tested in real-world recruiting systems, but this specific implementation is intended for experimentation and learning.

### Known Limitations
- LLM parsing accuracy depends on model quality and prompt engineering
- OCR functionality requires external service integration
- Performance benchmarks based on specific hardware configurations
- Multi-language support not yet implemented

### Future Enhancements
- [ ] Additional LLM providers (Gemini, local models via Ollama)
- [ ] Semantic skill matching with embeddings
- [ ] Resume quality feedback system
- [ ] Real-time resume builder/optimizer
- [ ] Bias detection and mitigation tools
- [ ] Industry-specific scoring profiles
- [ ] Multi-language support

---

**Last Updated:** 2025-01-12
