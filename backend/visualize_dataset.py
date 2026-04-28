import os
import matplotlib.pyplot as plt
from PIL import Image
import random

DATASET_PATH = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"

# Get all classes
classes = os.listdir(DATASET_PATH)

# Pick 9 random classes and show one image from each
fig, axes = plt.subplots(3, 3, figsize=(12, 12))
axes = axes.flatten()

random_classes = random.sample(classes, 9)

for i, cls in enumerate(random_classes):
    # Get random image from this class
    class_path = os.path.join(DATASET_PATH, cls)
    images = os.listdir(class_path)
    random_image = random.choice(images)
    
    # Load and show image
    img_path = os.path.join(class_path, random_image)
    img = Image.open(img_path)
    
    axes[i].imshow(img)
    axes[i].set_title(cls[:30], fontsize=8)
    axes[i].axis('off')

plt.tight_layout()
plt.savefig('backend\dataset_preview.png')
plt.show()
print("Preview saved!")