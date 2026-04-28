import os

# Path to your dataset
DATASET_PATH = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"

# Get all class folders
classes = os.listdir(DATASET_PATH)
print(f"Total classes: {len(classes)}")
print("\nAll disease classes:")
for i, cls in enumerate(classes):
    # Count images in each folder
    images = os.listdir(os.path.join(DATASET_PATH, cls))
    print(f"{i+1}. {cls} — {len(images)} images")