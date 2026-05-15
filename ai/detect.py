import sys
import json
import cv2
import pytesseract

def guess_scene(text):
    t = text.lower()

    if "mall" in t:
        return "shopping mall Phnom Penh"
    if "restaurant" in t:
        return "restaurant Phnom Penh"
    if "hotel" in t:
        return "hotel Phnom Penh"
    if "school" in t:
        return "school Phnom Penh"

    return "famous landmark Phnom Penh"

def main():
    img_path = sys.argv[1]

    img = cv2.imread(img_path)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2, fy=2)

    text = pytesseract.image_to_string(gray, config="--psm 6").strip()

    final = text if text else guess_scene("")

    print(json.dumps({
        "text": [final],
        "raw_text": text
    }))

if __name__ == "__main__":
    main()
