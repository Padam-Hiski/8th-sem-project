import os
from PIL import Image

DATASET_PATH = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"

classes = os.listdir(DATASET_PATH)

widths = []
heights = []

# Check first 5 images from each class
for cls in classes:
    class_path = os.path.join(DATASET_PATH, cls)
    images = os.listdir(class_path)[:5]
    
    for img_name in images:
        img_path = os.path.join(class_path, img_name)
        img = Image.open(img_path)
        w, h = img.size
        widths.append(w)
        heights.append(h)

print(f"Total images checked: {len(widths)}")
print(f"Common width: {max(set(widths), key=widths.count)}")
print(f"Common height: {max(set(heights), key=heights.count)}")
print(f"Min size: {min(widths)}x{min(heights)}")
print(f"Max size: {max(widths)}x{max(heights)}")