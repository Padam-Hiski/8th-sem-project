"""
CropGuard — Model Evaluation Script
=====================================
Generates:
  1. Classification Report (precision, recall, F1 per class)
  2. Confusion Matrix (saved as PNG)
  3. Per-class accuracy summary

FOLDER STRUCTURE EXPECTED:
---------------------------
8th-sem-project/
└── backend/
    ├── evaluate_model.py         ← PUT THIS FILE HERE
    ├── classes.json
    ├── diseases.json
    └── model/
        └── crop_disease_model_v2.h5

TEST DATASET FOLDER STRUCTURE EXPECTED:
-----------------------------------------
You need a folder of test images organized by class name.
The folder should look like this:

backend/
└── test_data/                    ← CREATE THIS FOLDER
    ├── Rice___Leaf_Blast/
    │   ├── image1.jpg
    │   ├── image2.jpg
    │   └── ...
    ├── Rice___Brown_Spot/
    │   ├── image1.jpg
    │   └── ...
    ├── Tomato___Early_Blight/
    │   └── ...
    └── ... (one folder per class)

HOW TO RUN:
-----------
1. Place this file in:  8th-sem-project/backend/
2. Create test_data/ folder with class subfolders
3. Open terminal in backend/ folder
4. Run:  python evaluate_model.py

OUTPUT FILES (saved in backend/evaluation_results/):
------------------------------------------------------
  - classification_report.txt     → per-class precision, recall, F1
  - confusion_matrix.png          → visual heatmap
  - evaluation_summary.txt        → quick stats for defense
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image

# ─────────────────────────────────────────────
# CONFIGURATION — adjust paths if needed
# ─────────────────────────────────────────────

BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH      = os.path.join(BASE_DIR, "model", "crop_disease_model_v2.h5")
CLASSES_PATH    = os.path.join(BASE_DIR, "classes.json")
TEST_DATA_DIR   = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"
OUTPUT_DIR      = os.path.join(BASE_DIR, "evaluation_results")
IMG_SIZE        = (224, 224)

# ─────────────────────────────────────────────
# SETUP
# ─────────────────────────────────────────────

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("  CropGuard — Model Evaluation")
print("=" * 60)

# ─────────────────────────────────────────────
# LOAD MODEL
# ─────────────────────────────────────────────

print("\n[1/5] Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print(f"      ✓ Model loaded from: {MODEL_PATH}")

# ─────────────────────────────────────────────
# LOAD CLASS NAMES
# ─────────────────────────────────────────────

print("\n[2/5] Loading class names...")
with open(CLASSES_PATH, "r") as f:
    class_names = json.load(f)
print(f"      ✓ {len(class_names)} classes loaded")

# ─────────────────────────────────────────────
# LOAD TEST IMAGES
# ─────────────────────────────────────────────

print("\n[3/5] Loading test images...")

if not os.path.exists(TEST_DATA_DIR):
    print(f"\n  ✗ ERROR: test_data/ folder not found at: {TEST_DATA_DIR}")
    print("  Please create the folder structure as described at the top of this script.")
    exit(1)

y_true = []
y_pred = []
skipped = 0
total   = 0

for class_name in sorted(os.listdir(TEST_DATA_DIR)):
    class_folder = os.path.join(TEST_DATA_DIR, class_name)

    if not os.path.isdir(class_folder):
        continue

    if class_name not in class_names:
        print(f"      ⚠ Skipping unknown class folder: {class_name}")
        continue

    true_idx = class_names.index(class_name)

    for img_file in os.listdir(class_folder):
        if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        img_path = os.path.join(class_folder, img_file)

        try:
            # Preprocess — same pipeline as app.py
            img = keras_image.load_img(img_path, target_size=IMG_SIZE)
            img_array = keras_image.img_to_array(img)
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            predictions = model.predict(img_array, verbose=0)
            pred_idx    = int(np.argmax(predictions[0]))

            y_true.append(true_idx)
            y_pred.append(pred_idx)
            total += 1

        except Exception as e:
            skipped += 1

print(f"      ✓ Processed {total} images across {len(set(y_true))} classes")
if skipped:
    print(f"      ⚠ Skipped {skipped} unreadable files")

if total == 0:
    print("\n  ✗ ERROR: No images found in test_data/ folder.")
    print("  Make sure your test images are in subfolders named after each class.")
    exit(1)

# ─────────────────────────────────────────────
# CLASSIFICATION REPORT
# ─────────────────────────────────────────────

print("\n[4/5] Generating classification report...")

# Get only the class names that appear in test data
unique_indices = sorted(set(y_true))
unique_names   = [class_names[i] for i in unique_indices]

report = classification_report(
    y_true,
    y_pred,
    labels=unique_indices,
    target_names=unique_names,
    digits=4
)

overall_accuracy = accuracy_score(y_true, y_pred) * 100

print("\n" + "─" * 60)
print(report)
print("─" * 60)
print(f"  Overall Accuracy: {overall_accuracy:.2f}%")
print("─" * 60)

# Save report
report_path = os.path.join(OUTPUT_DIR, "classification_report.txt")
with open(report_path, "w") as f:
    f.write("CropGuard — Classification Report\n")
    f.write("=" * 60 + "\n\n")
    f.write(report)
    f.write("\n" + "─" * 60 + "\n")
    f.write(f"Overall Accuracy: {overall_accuracy:.2f}%\n")
    f.write(f"Total Images Evaluated: {total}\n")

print(f"\n      ✓ Report saved to: {report_path}")

# ─────────────────────────────────────────────
# CONFUSION MATRIX
# ─────────────────────────────────────────────

print("\n[5/5] Generating confusion matrix...")

cm = confusion_matrix(y_true, y_pred, labels=unique_indices)

# Shorten class names for display (remove crop prefix)
short_names = [n.split("___")[-1].replace("_", " ") for n in unique_names]

fig_size = max(16, len(unique_names) // 2)
plt.figure(figsize=(fig_size, fig_size - 2))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="YlOrRd",
    xticklabels=short_names,
    yticklabels=short_names,
    linewidths=0.5,
    linecolor="white",
    cbar_kws={"shrink": 0.8}
)

plt.title(
    f"CropGuard — Confusion Matrix\nOverall Accuracy: {overall_accuracy:.2f}%",
    fontsize=14,
    fontweight="bold",
    pad=20
)
plt.ylabel("True Label", fontsize=12, labelpad=10)
plt.xlabel("Predicted Label", fontsize=12, labelpad=10)
plt.xticks(rotation=45, ha="right", fontsize=8)
plt.yticks(rotation=0, fontsize=8)
plt.tight_layout()

cm_path = os.path.join(OUTPUT_DIR, "confusion_matrix.png")
plt.savefig(cm_path, dpi=150, bbox_inches="tight")
plt.close()

print(f"      ✓ Confusion matrix saved to: {cm_path}")

# ─────────────────────────────────────────────
# SUMMARY FILE
# ─────────────────────────────────────────────

from sklearn.metrics import classification_report as cr
report_dict = cr(
    y_true,
    y_pred,
    labels=unique_indices,
    target_names=unique_names,
    output_dict=True
)

# Find best and worst performing classes
class_f1 = {
    name: report_dict[name]["f1-score"]
    for name in unique_names
    if name in report_dict
}

best_class  = max(class_f1, key=class_f1.get)
worst_class = min(class_f1, key=class_f1.get)

# Rice class performance
rice_classes = [n for n in unique_names if n.startswith("Rice___")]
rice_f1_avg  = np.mean([class_f1[n] for n in rice_classes if n in class_f1])

summary_path = os.path.join(OUTPUT_DIR, "evaluation_summary.txt")
with open(summary_path, "w") as f:
    f.write("CropGuard — Evaluation Summary\n")
    f.write("=" * 60 + "\n\n")
    f.write(f"Overall Accuracy     : {overall_accuracy:.2f}%\n")
    f.write(f"Total Images Tested  : {total}\n")
    f.write(f"Total Classes Tested : {len(unique_names)}\n\n")
    f.write("─" * 60 + "\n")
    f.write(f"Best Performing Class : {best_class}\n")
    f.write(f"  F1-Score            : {class_f1[best_class]:.4f}\n\n")
    f.write(f"Worst Performing Class: {worst_class}\n")
    f.write(f"  F1-Score            : {class_f1[worst_class]:.4f}\n\n")
    f.write("─" * 60 + "\n")
    f.write(f"Rice Classes Average F1: {rice_f1_avg:.4f}\n\n")
    f.write("Rice Class Breakdown:\n")
    for rc in rice_classes:
        if rc in class_f1:
            f.write(f"  {rc:<40} F1: {class_f1[rc]:.4f}\n")
    f.write("\n" + "─" * 60 + "\n")
    f.write("Files Generated:\n")
    f.write(f"  - classification_report.txt\n")
    f.write(f"  - confusion_matrix.png\n")
    f.write(f"  - evaluation_summary.txt\n")

print(f"      ✓ Summary saved to: {summary_path}")

# ─────────────────────────────────────────────
# FINAL PRINT
# ─────────────────────────────────────────────

print("\n" + "=" * 60)
print("  EVALUATION COMPLETE")
print("=" * 60)
print(f"  Overall Accuracy     : {overall_accuracy:.2f}%")
print(f"  Best Class (F1)      : {best_class.split('___')[-1]} — {class_f1[best_class]:.4f}")
print(f"  Worst Class (F1)     : {worst_class.split('___')[-1]} — {class_f1[worst_class]:.4f}")
print(f"  Rice Classes Avg F1  : {rice_f1_avg:.4f}")
print(f"\n  Results saved in: backend/evaluation_results/")
print("=" * 60)
print("\n  Share the contents of evaluation_results/ with Claude!")