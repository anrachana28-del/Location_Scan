import sys
import json
from PIL import Image
import pytesseract

def main():
    try:
        img_path = sys.argv[1]

        img = Image.open(img_path)

        # 🧠 OCR (FAST MODE)
        text = pytesseract.image_to_string(img)

        text_list = []

        if text and text.strip():
            text_list = [text.strip()]

        print(json.dumps({
            "text": text_list
        }))

    except Exception as e:
        print(json.dumps({
            "text": [],
            "error": str(e)
        }))

if __name__ == "__main__":
    main()
