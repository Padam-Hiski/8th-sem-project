import os
import json

DATASET_PATH = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"

# Get and sort class names
classes = sorted(os.listdir(DATASET_PATH))

# Save to JSON file
with open("backend\classes.json", "w") as f:
    json.dump(classes, f, indent=2)

print(f"Saved {len(classes)} classes:")
for i, cls in enumerate(classes):
    print(f"{i}: {cls}")