"""
Resume Text Extractor

Multi-format resume text extraction with intelligent fallback strategies.
Supports PDF, DOCX, and plain text formats with OCR fallback for image-based PDFs.

Author: Ravindra Kanchikare (krhebber)
License: MIT
"""

import docx2txt
from pdfminer.high_level import extract_text
from pdfminer.pdfparser import PDFSyntaxError
from pypdf import PdfReader
from pypdf.errors import PdfReadError
import re
import base64
import fitz  # PyMuPDF
from typing import Dict, Optional, List, Union
from io import BytesIO
import zipfile

class ExtractionError(Exception):
    """Base class for extraction errors."""
    pass

class PDFExtractionError(ExtractionError):
    """Raised when PDF text extraction fails."""
    pass

class DOCXExtractionError(ExtractionError):
    """Raised when DOCX text extraction fails."""
    pass

class TextExtractionError(ExtractionError):
    """Raised when plain text extraction fails."""
    pass

class ImageConversionError(ExtractionError):
    """Raised when PDF to image conversion fails."""
    pass

class SupportedFormats:
    """Enum-like class for supported file formats"""
    PDF = 'PDF'
    DOCX = 'DOCX'
    TEXT = 'TEXT'


class ExtractionResult:
    """Container for extraction results"""
    def __init__(self, text: Optional[str] = None, images: Optional[List[str]] = None, failed: bool = False):
        self.text = text
        self.images = images
        self.failed = failed

    def to_dict(self) -> Dict:
        return {
            'text': self.text,
            'images': self.images,
            'failed': self.failed
        }

    def __repr__(self) -> str:
        if self.failed:
            return f"ExtractionResult(failed=True)"
        elif self.images:
            return f"ExtractionResult(images={len(self.images)} pages)"
        else:
            return f"ExtractionResult(text_length={len(self.text) if self.text else 0})"


def clean_text(text: str) -> str:
    """
    Clean extracted text by normalizing whitespace and removing null characters.

    Args:
        text: Raw extracted text

    Returns:
        Cleaned text with normalized whitespace
    """
    if not text:
        return ""

    # Replace multiple newlines and spaces with single space
    cleaned = re.sub(r'[\r\n]+|\s+', ' ', text)

    # Remove null characters
    cleaned = cleaned.replace("\u0000", '')

    return cleaned.strip()


class ResumeExtractor:
    """
    Extract text from resume files with intelligent fallback strategies.

    Extraction Strategy:
    1. PDF Files:
       - Try pdfminer.six (best for text-based PDFs)
       - Fallback to pypdf if pdfminer fails
       - If text < 500 chars, assume image-based PDF and extract images for OCR

    2. DOCX Files:
       - Use docx2txt for text extraction

    3. TEXT Files:
       - Direct text reading with UTF-8 decoding

    Attributes:
        file: File object or BytesIO containing resume data
        format: One of SupportedFormats (PDF, DOCX, TEXT)
        min_text_threshold: Minimum characters before triggering OCR fallback (default: 500)
    """

    def __init__(self, file: Union[BytesIO, str], format: str, min_text_threshold: int = 500):
        """
        Initialize the ResumeExtractor.

        Args:
            file: File path (str) or file-like object (BytesIO)
            format: File format (use SupportedFormats constants)
            min_text_threshold: Minimum text length before OCR fallback
        """
        self.file = file
        self.format = format
        self.min_text_threshold = min_text_threshold

    def extract(self) -> ExtractionResult:
        """
        Extract text from resume file using format-specific strategies.

        Returns:
            ExtractionResult containing text, images, or failure status
        """
        if self.format == SupportedFormats.PDF:
            return self._extract_pdf()
        elif self.format == SupportedFormats.DOCX:
            return self._extract_docx()
        elif self.format == SupportedFormats.TEXT:
            return self._extract_text()
        else:
            return ExtractionResult(failed=True)

    def _extract_pdf(self) -> ExtractionResult:
        """
        Extract text from PDF with three-tier fallback strategy.

        Strategy:
        1. pdfminer.six - Most reliable for text-based PDFs
        2. pypdf - Backup if pdfminer fails
        3. Image extraction - If text < min_text_threshold (image-based PDF)

        Returns:
            ExtractionResult with text or images for OCR
        """
        text = None
        images = None

        try:
            # Tier 1: Try pdfminer.six
            text = clean_text(extract_text(self.file))
        except PDFSyntaxError as e:
            print(f"pdfminer.six failed: {e}. Falling back to pypdf.")
        except Exception as e:
            print(f"An unexpected error occurred with pdfminer.six: {e}. Falling back to pypdf.")

        try:
            # Tier 2: Fallback to pypdf if pdfminer returns empty
            if not text or text.strip() == '':
                if hasattr(self.file, 'seek'):
                    self.file.seek(0)
                pdf_reader = PdfReader(self.file)
                page_texts = [p.extract_text() for p in pdf_reader.pages]
                text = " ".join(page_texts)
        except PdfReadError as e:
            raise PDFExtractionError(f"pypdf failed to read PDF: {e}") from e
        except Exception as e:
            raise PDFExtractionError(f"An unexpected error occurred with pypdf: {e}") from e

        try:
            # Tier 3: If still minimal text, assume image-based PDF
            if not text or len(text.strip()) < self.min_text_threshold:
                print(f'Text extraction yielded {len(text) if text else 0} chars. Extracting images for OCR.')
                images = self._pdf_to_images()
                text = None # Clear text if we are returning images
        except Exception as e:
            raise ImageConversionError(f"Failed to convert PDF to images: {e}") from e

        if images:
            return ExtractionResult(images=images)
        elif text and text.strip():
            return ExtractionResult(text=text)
        else:
            return ExtractionResult(failed=True)

    def _extract_docx(self) -> ExtractionResult:
        """
        Extract text from DOCX files.

        Returns:
            ExtractionResult with extracted text
        """
        try:
            text = clean_text(docx2txt.process(self.file))
            if text and text.strip():
                return ExtractionResult(text=text)
            else:
                return ExtractionResult(failed=True)
        except zipfile.BadZipFile as e:
            raise DOCXExtractionError(f"Invalid DOCX file: {e}") from e
        except Exception as e:
            raise DOCXExtractionError(f"Failed to extract text from DOCX: {e}") from e

    def _extract_text(self) -> ExtractionResult:
        """
        Extract text from plain text files.

        Returns:
            ExtractionResult with extracted text
        """
        try:
            if isinstance(self.file, str):
                with open(self.file, 'r', encoding='utf-8') as f:
                    text = clean_text(f.read())
            else:
                if hasattr(self.file, 'seek'):
                    self.file.seek(0)
                text = clean_text(self.file.read().decode('utf-8'))

            if text and text.strip():
                return ExtractionResult(text=text)
            else:
                return ExtractionResult(failed=True)
        except FileNotFoundError as e:
            raise TextExtractionError(f"Text file not found: {self.file}") from e
        except UnicodeDecodeError as e:
            raise TextExtractionError(f"Failed to decode text file with UTF-8: {e}") from e
        except Exception as e:
            raise TextExtractionError(f"Failed to read text file: {e}") from e

    def _pdf_to_images(self) -> List[str]:
        """
        Convert PDF pages to base64-encoded images for OCR processing.

        Two strategies:
        1. If page has embedded images, extract them directly
        2. If no images, render the entire page as image (for scanned PDFs)

        Returns:
            List of base64-encoded image strings
        """
        try:
            if hasattr(self.file, 'seek'):
                self.file.seek(0)
            pdf_doc = fitz.open(stream=self.file, filetype="pdf")
            image_data_list = []

            for page_index in range(len(pdf_doc)):
                page = pdf_doc[page_index]
                image_list = page.get_images()

                if not image_list:
                    image_data_list.append(self._page_to_image(page))
                else:
                    for img in image_list:
                        xref = img[0]
                        base_image = pdf_doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_data_list.append(base64.b64encode(image_bytes).decode('utf-8'))
            return image_data_list
        except Exception as e:
            raise ImageConversionError(f"PyMuPDF failed to process PDF for image extraction: {e}") from e

    def _page_to_image(self, page) -> str:
        """
        Render a PDF page to a high-resolution image.

        Args:
            page: PyMuPDF page object

        Returns:
            Base64-encoded image string
        """
        try:
            zoom = 2
            mat = fitz.Matrix(zoom, zoom)
            pix_bytes = page.get_pixmap(matrix=mat).tobytes()
            return base64.b64encode(pix_bytes).decode('utf-8')
        except Exception as e:
            raise ImageConversionError(f"Failed to render page to image: {e}") from e

def extract_resume_text(file: Union[BytesIO, str], format: str) -> ExtractionResult:
    """
    Convenience function to extract text from resume files.

    Args:
        file: File path or BytesIO object
        format: File format (use SupportedFormats constants)

    Returns:
        ExtractionResult containing text, images, or failure status

    Example:
        >>> with open('resume.pdf', 'rb') as f:
        >>>     result = extract_resume_text(BytesIO(f.read()), SupportedFormats.PDF)
        >>>     if result.text:
        >>>         print(result.text)
    """
    extractor = ResumeExtractor(file, format)
    return extractor.extract()