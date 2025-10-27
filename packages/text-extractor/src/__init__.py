"""
Resume Text Extractor

Multi-format resume text extraction with intelligent fallback strategies.
"""

from .resume_extractor import (
    ResumeExtractor,
    ExtractionResult,
    SupportedFormats,
    extract_resume_text,
    clean_text,
)

__version__ = "1.0.0"

__all__ = [
    "ResumeExtractor",
    "ExtractionResult",
    "SupportedFormats",
    "extract_resume_text",
    "clean_text",
]
