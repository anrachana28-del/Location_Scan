import sys
import json
from PIL import Image
import easyocr

# 📌 Image path from Node.js
image_path = sys.argv[1]

# 🧠 Load OCR model
reader = easyocr.Reader(['en'])

def detect_text(path):

    try:
        result = reader.readtext(path)

        texts = []

        for item in result:
            texts.append(item[1])

        return texts

    except Exception as e:
        return []

# 🚀 Run detection
texts = detect_text(image_path)

# 🧾 Output JSON (IMPORTANT for Node.js)
output = {
    "text": texts
}

print(json.dumps(output))
