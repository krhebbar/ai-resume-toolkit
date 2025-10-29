from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def generate_docx(path):
    document = Document()
    document.add_paragraph("This is a dummy docx file.")
    document.save(path)

def generate_pdf(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.drawString(100, 750, "This is a dummy PDF file.")
    c.save()

if __name__ == "__main__":
    generate_docx("packages/text-extractor/tests/assets/dummy.docx")
    generate_pdf("packages/text-extractor/tests/assets/dummy.pdf")