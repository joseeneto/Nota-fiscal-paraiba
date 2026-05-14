import pdfplumber
import tempfile
import os

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    # Salvamos os bytes em um arquivo temporário no disco, pois pdfplumber não lida com bytes nus diretamente.
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(pdf_bytes)
        tmp_file_path = tmp_file.name
        
    try:
        with pdfplumber.open(tmp_file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Erro ao extrair PDF: {e}")
    finally:
        # Lembre-se de remover o arquivo temporário após o uso
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
            
    return text.strip()
