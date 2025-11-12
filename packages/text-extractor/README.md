# Resume Text Extractor

Multi-format resume text extraction with intelligent OCR fallback strategies.

## Features

- **Multiple Format Support**: PDF, DOCX, and plain text
- **Intelligent Fallback**: 3-tier extraction strategy for PDFs
- **OCR-Ready**: Automatic image extraction for scanned/image-based PDFs
- **Experimental**: Clean API with comprehensive error handling for learning and research
- **Type-Safe**: Full type hints for Python 3.8+

## Installation

```bash
pip install -e .
```

## Quick Start

```python
from io import BytesIO
from resume_extractor import extract_resume_text, SupportedFormats

# Extract from PDF
with open('resume.pdf', 'rb') as f:
    result = extract_resume_text(BytesIO(f.read()), SupportedFormats.PDF)

if result.text:
    print(f"Extracted {len(result.text)} characters")
    print(result.text)
elif result.images:
    print(f"Image-based PDF detected. {len(result.images)} images extracted for OCR")
    # Process images with your OCR service
else:
    print("Extraction failed")
```

## PDF Extraction Strategy

The library uses a sophisticated 3-tier fallback strategy:

1. **pdfminer.six** (Primary) - Best for text-based PDFs with complex layouts
2. **pypdf** (Fallback) - Backup extraction if pdfminer fails
3. **Image Extraction** (OCR Path) - For scanned/image-based PDFs when text < 500 chars

## API Reference

### `extract_resume_text(file, format)`

Convenience function for simple text extraction.

**Parameters:**
- `file`: File path (str) or BytesIO object
- `format`: One of `SupportedFormats.PDF`, `SupportedFormats.DOCX`, `SupportedFormats.TEXT`

**Returns:** `ExtractionResult`

**Raises:**
- `PDFExtractionError`: If PDF parsing fails with all strategies.
- `DOCXExtractionError`: If DOCX parsing fails.
- `TextExtractionError`: If text file parsing fails.
- `ImageConversionError`: If PDF to image conversion fails.

### `ResumeExtractor`

Main extraction class for advanced usage.

```python
from resume_extractor import ResumeExtractor, SupportedFormats

extractor = ResumeExtractor(
    file=file_obj,
    format=SupportedFormats.PDF,
    min_text_threshold=500  # Trigger OCR if text < 500 chars
)

result = extractor.extract()
```

### `ExtractionResult`

Container for extraction results.

**Attributes:**
- `text` (str | None): Extracted text
- `images` (List[str] | None): Base64-encoded images for OCR
- `failed` (bool): True if extraction completely failed

**Methods:**
- `to_dict()`: Convert to dictionary
- `__repr__()`: Human-readable representation

## Use Cases

### Standard Resume Parsing

```python
result = extract_resume_text(resume_file, SupportedFormats.PDF)
if result.text:
    # Pass to LLM or parser
    parsed_resume = parse_with_llm(result.text)
```

### Handling Scanned Resumes

```python
result = extract_resume_text(resume_file, SupportedFormats.PDF)
if result.images:
    # Process with OCR service
    text = ocr_service.process_images(result.images)
    parsed_resume = parse_with_llm(text)
```

### Custom Threshold

```python
# Trigger OCR earlier for better quality
extractor = ResumeExtractor(
    file=resume_file,
    format=SupportedFormats.PDF,
    min_text_threshold=1000  # Require 1000+ chars before skipping OCR
)
```

## Dependencies

- `pdfminer.six` - Primary PDF text extraction
- `pypdf` - Fallback PDF extraction
- `PyMuPDF` (fitz) - PDF to image conversion
- `docx2txt` - DOCX text extraction

## License

MIT License - See LICENSE file for details

## Author

Ravindra Kanchikare (krhebber)
