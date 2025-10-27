"""
Setup configuration for ai-resume-toolkit text-extractor package
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="resume-text-extractor",
    version="1.0.0",
    author="Ravindra Kanchikare (krhebber)",
    description="Multi-format resume text extraction with intelligent OCR fallback",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/krhebber/ai-resume-toolkit",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Text Processing :: General",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pdfminer.six>=20221105",
        "pypdf>=3.17.0",
        "PyMuPDF>=1.23.6",
        "docx2txt>=0.8",
        "requests>=2.31.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
        ],
    },
)
