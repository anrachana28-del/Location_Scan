import sys
import json
import cv2
import pytesseract

def main():
    try:
        img_path = sys.argv[1]

        img = cv2.imread(img_path)

        if img is None:
            print(json.dumps({"text": []}))
            return

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=2, fy=2)

        text = pytesseract.image_to_string(gray, config='--psm 6')

        text_list = [text.strip()] if text and text.strip() else []

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
