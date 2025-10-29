import pytest
from io import BytesIO
from resume_extractor import ResumeExtractor, SupportedFormats, ExtractionResult, PDFExtractionError, DOCXExtractionError, TextExtractionError

# Dummy file content
DUMMY_TEXT = "This is a test."

@pytest.fixture
def txt_file():
    return BytesIO(DUMMY_TEXT.encode('utf-8'))

@pytest.fixture
def docx_file():
    with open("tests/assets/dummy.docx", "rb") as f:
        return BytesIO(f.read())

@pytest.fixture
def pdf_file():
    with open("tests/assets/dummy.pdf", "rb") as f:
        return BytesIO(f.read())

def test_extract_text_file(txt_file):
    """Test text extraction from a plain text file."""
    extractor = ResumeExtractor(txt_file, SupportedFormats.TEXT)
    result = extractor.extract()
    assert isinstance(result, ExtractionResult)
    assert not result.failed
    assert "This is a test." in result.text

def test_extract_docx_file(docx_file):
    """Test text extraction from a DOCX file."""
    extractor = ResumeExtractor(docx_file, SupportedFormats.DOCX)
    result = extractor.extract()
    assert isinstance(result, ExtractionResult)
    assert not result.failed
    assert "This is a dummy docx file." in result.text

def test_extract_pdf_file_success(pdf_file):
    """Test successful text extraction from a PDF file by lowering the threshold."""
    extractor = ResumeExtractor(pdf_file, SupportedFormats.PDF, min_text_threshold=10)
    result = extractor.extract()
    assert isinstance(result, ExtractionResult)
    assert not result.failed
    assert result.text is not None
    assert "This is a dummy PDF file." in result.text
    assert result.images is None

def test_pdf_ocr_fallback(pdf_file):
    """Test that image extraction is triggered for PDFs with minimal text."""
    # Use the default threshold of 500
    extractor = ResumeExtractor(pdf_file, SupportedFormats.PDF)
    result = extractor.extract()
    assert isinstance(result, ExtractionResult)
    assert not result.failed
    assert result.text is None
    assert result.images is not None
    assert len(result.images) > 0

def test_unsupported_format():
    """Test that an unsupported format fails gracefully."""
    file = BytesIO(b"dummy content")
    extractor = ResumeExtractor(file, "unsupported")
    result = extractor.extract()
    assert result.failed

def test_bad_docx_file():
    """Test that a bad docx file raises a DOCXExtractionError."""
    file = BytesIO(b"this is not a docx file")
    extractor = ResumeExtractor(file, SupportedFormats.DOCX)
    with pytest.raises(DOCXExtractionError):
        extractor.extract()

def test_bad_pdf_file():
    """Test that a bad pdf file raises a PDFExtractionError."""
    file = BytesIO(b"this is not a pdf file")
    extractor = ResumeExtractor(file, SupportedFormats.PDF)
    with pytest.raises(PDFExtractionError):
        extractor.extract()

def test_bad_text_file():
    """Test that a bad text file raises a TextExtractionError."""
    file = BytesIO(b"\x80")
    extractor = ResumeExtractor(file, SupportedFormats.TEXT)
    with pytest.raises(TextExtractionError):
        extractor.extract()