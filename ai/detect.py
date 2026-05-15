import sys
import json
import cv2
import pytesseract

def safe(data):
    try:
        print(json.dumps(data))
    except:
        print('{"text": []}')

def main():
    try:
        img_path = sys.argv[1]

        img = cv2.imread(img_path)

        if img is None:
            safe({"text": []})
            return

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=2, fy=2)

        text = pytesseract.image_to_string(gray, config="--psm 6").strip()

        safe({
            "text": [text] if text else []
        })

    except Exception as e:
        safe({
            "text": [],
            "error": str(e)
        })

if __name__ == "__main__":
    main()
