import sys
import json
import os

# OCR engine
import easyocr

# Optional image check
from PIL import Image

# Disable GPU (important for Render)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

def main():

    try:
        # get image path from Node.js
        image_path = sys.argv[1]

        # check file exists
        if not os.path.exists(image_path):
            print(json.dumps({
                "error": "Image not found",
                "text": []
            }))
            return

        # init OCR
        reader = easyocr.Reader(['en'], gpu=False)

        # read image
        result = reader.readtext(image_path)

        # extract text only
        texts = []

        for item in result:
            if len(item) >= 2:
                texts.append(str(item[1]))

        # clean empty results
        texts = [t for t in texts if t.strip() != ""]

        # final output
        output = {
            "text": texts if texts else [],
            "count": len(texts)
        }

        print(json.dumps(output))

    except Exception as e:

        print(json.dumps({
            "error": str(e),
            "text": []
        }))


if __name__ == "__main__":
    main()
