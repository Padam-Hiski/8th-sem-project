"""
finetune_model.py
-----------------
Fine-tunes the existing plant disease model to add 6 Rice classes.
Total classes: 38 (existing) + 6 (Rice) = 44

- Loads YOUR existing crop_disease_model.h5
- Freezes MobileNetV2 base entirely (CPU-friendly)
- Replaces classification head for all 44 classes
- Reads existing classes from backend/classes.json (simple list)
- Writes new diseases_v2.json with all 44 class entries
- Healthy class weight boosted to fix misidentification

Usage:
    cd D:\proj\CDD
    .\tf_env\Scripts\Activate.ps1
    pip install scikit-learn        (if not already installed)
    python finetune_model.py

Estimated time on CPU: 4-6 hours
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight
import matplotlib
matplotlib.use("Agg")   # no display needed — saves plot to file
import matplotlib.pyplot as plt

# ─────────────────────────────────────────────
# CONFIG  ← only edit this section if paths differ
# ─────────────────────────────────────────────
DATASET_DIR      = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"
OLD_MODEL_PATH   = r"D:\proj\CDD\backend\model\crop_disease_model.h5"
NEW_MODEL_PATH   = r"D:\proj\CDD\backend\model\crop_disease_model_v2.h5"
OLD_CLASSES_JSON = r"D:\proj\CDD\backend\classes.json"          # simple list
NEW_CLASSES_JSON = r"D:\proj\CDD\backend\database\diseases_v2.json"
DISEASES_JSON    = r"D:\proj\CDD\backend\database\diseases.json" # rich dict

IMG_SIZE   = (224, 224)
BATCH_SIZE = 16    # smaller than your original 32 — easier on CPU RAM
EPOCHS     = 12
LR         = 1e-3

# ─────────────────────────────────────────────
# Rice disease info — pre-filled for diseases_v2.json
# ─────────────────────────────────────────────
RICE_CLASS_INFO = {
    "Rice___Bacterial_Leaf_Blight": {
        "disease": "Bacterial Leaf Blight",
        "description": "A serious bacterial disease of rice caused by Xanthomonas oryzae pv. oryzae, leading to wilting and yellowing of leaves.",
        "symptoms": ["Water-soaked lesions on leaf margins", "Yellowing and wilting of leaves", "Milky or opaque bacterial ooze on lesions"],
        "treatment": ["Use copper-based bactericides", "Apply streptomycin in early stages", "Remove and destroy infected plant material"],
        "prevention": ["Use resistant rice varieties", "Avoid excessive nitrogen fertilizer", "Ensure proper field drainage"],
        "severity": "High",
        "is_healthy": False
    },
    "Rice___Brown_Spot": {
        "disease": "Brown Spot",
        "description": "A fungal disease caused by Cochliobolus miyabeanus affecting rice leaves and grains, reducing yield significantly.",
        "symptoms": ["Oval to circular brown spots on leaves", "Dark brown borders with grey or whitish centers", "Spots on glumes and grains"],
        "treatment": ["Apply fungicides like Iprodione or Tricyclazole", "Use potassium silicate to strengthen cell walls"],
        "prevention": ["Maintain proper soil nutrition especially potassium", "Use certified disease-free seeds", "Avoid water stress"],
        "severity": "Medium",
        "is_healthy": False
    },
    "Rice___Healthy": {
        "disease": "Healthy",
        "description": "The rice plant shows no signs of disease. Leaves are green, upright, and free from lesions or discoloration.",
        "symptoms": ["No visible symptoms"],
        "treatment": ["No treatment needed"],
        "prevention": ["Maintain regular crop monitoring", "Follow good agricultural practices"],
        "severity": "None",
        "is_healthy": True
    },
    "Rice___Leaf_Blast": {
        "disease": "Leaf Blast",
        "description": "One of the most destructive rice diseases caused by Magnaporthe oryzae fungus, affecting leaves, nodes, and panicles.",
        "symptoms": ["Diamond-shaped lesions with gray centers and brown borders", "Rapid leaf blighting in severe cases", "White to gray spindle-shaped spots"],
        "treatment": ["Apply Tricyclazole or Isoprothiolane fungicides", "Use silicon fertilizers to strengthen plants"],
        "prevention": ["Plant blast-resistant varieties", "Avoid excessive nitrogen", "Maintain proper plant spacing for air circulation"],
        "severity": "High",
        "is_healthy": False
    },
    "Rice___Leaf_Scald": {
        "disease": "Leaf Scald",
        "description": "A fungal disease caused by Microdochium oryzae producing a characteristic scalded appearance on rice leaves.",
        "symptoms": ["Irregular lesions with light tan or straw-colored centers", "Zonate or banded appearance on leaves", "Lesions with dark brown margins"],
        "treatment": ["Apply appropriate fungicides at early infection stage", "Remove heavily infected plant debris"],
        "prevention": ["Use resistant varieties where available", "Avoid dense planting", "Balanced fertilization"],
        "severity": "Medium",
        "is_healthy": False
    },
    "Rice___Sheath_Blight": {
        "disease": "Sheath Blight",
        "description": "A major rice disease caused by Rhizoctonia solani fungus, severe under high humidity and dense planting conditions.",
        "symptoms": ["Oval or elliptical lesions on leaf sheaths", "Lesions with gray-white centers and brown borders", "Lodging of plants in severe infections"],
        "treatment": ["Apply fungicides like Validamycin or Hexaconazole", "Use biological control agents like Trichoderma"],
        "prevention": ["Reduce plant density", "Avoid excessive nitrogen fertilization", "Drain fields periodically"],
        "severity": "High",
        "is_healthy": False
    }
}

# ═══════════════════════════════════════════════════════════
# STEP 1 — Scan dataset folder
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 1/6 — Scanning dataset folder")
print("═" * 60)

if not os.path.exists(DATASET_DIR):
    print(f"  ERROR: Dataset folder not found:\n  {DATASET_DIR}")
    exit(1)

all_classes = sorted([
    d for d in os.listdir(DATASET_DIR)
    if os.path.isdir(os.path.join(DATASET_DIR, d))
])

rice_classes     = [c for c in all_classes if c.startswith("Rice___")]
existing_classes = [c for c in all_classes if not c.startswith("Rice___")]

print(f"  Existing PlantVillage classes : {len(existing_classes)}")
print(f"  New Rice classes              : {len(rice_classes)}")
print(f"  Total                         : {len(all_classes)}")

if len(rice_classes) == 0:
    print("\n  ERROR: No Rice___ folders found in your dataset!")
    print("  Rename and move your Rice folders first:")
    print("    'Bacterial Leaf Blight'  →  Rice___Bacterial_Leaf_Blight")
    print("    'Brown Spot'             →  Rice___Brown_Spot")
    print("    'Healthy Rice Leaf'      →  Rice___Healthy")
    print("    'Leaf Blast'             →  Rice___Leaf_Blast")
    print("    'Leaf scald'             →  Rice___Leaf_Scald")
    print("    'Sheath Blight'          →  Rice___Sheath_Blight")
    exit(1)

print("\n  Rice classes detected:")
for rc in rice_classes:
    img_count = len([
        f for f in os.listdir(os.path.join(DATASET_DIR, rc))
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))
    ])
    print(f"    ✓  {rc}  ({img_count} images)")

# ═══════════════════════════════════════════════════════════
# STEP 2 — Load existing model and extract base
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 2/6 — Loading existing model")
print("═" * 60)

if not os.path.exists(OLD_MODEL_PATH):
    print(f"  ERROR: Model not found:\n  {OLD_MODEL_PATH}")
    exit(1)

old_model = tf.keras.models.load_model(OLD_MODEL_PATH)
print(f"  Loaded      : {OLD_MODEL_PATH}")
print(f"  Input shape : {old_model.input_shape}")
print(f"  Old classes : {old_model.output_shape[-1]}")

# Your train_model.py structure:
#   MobileNetV2 base → GlobalAveragePooling2D → Dropout(0.3) → Dense(128) → Dense(38)
# We extract everything up to and including GlobalAveragePooling2D output.

base_model = None

# First try: look for a nested Keras Model (MobileNetV2 as sub-model)
for layer in old_model.layers:
    if isinstance(layer, tf.keras.Model):
        base_model = layer
        print(f"  Base found  : {base_model.name}  ({len(base_model.layers)} layers)")
        break

# Fallback: flat model — scan backwards for last non-classification layer
if base_model is None:
    base_out = None
    base_layer_name = None
    for layer in reversed(old_model.layers):
        if not isinstance(layer, (layers.Dense, layers.Dropout)):
            base_out = layer.output
            base_layer_name = layer.name
            break
    if base_out is None:
        print("  ERROR: Could not extract base from model. Exiting.")
        exit(1)
    base_model = Model(inputs=old_model.input, outputs=base_out, name="mobilenetv2_base")
    print(f"  Base layer  : {base_layer_name}  (output shape: {base_model.output_shape})")

# Freeze all base layers — only the new head will train
base_model.trainable = False
total_layers = len(base_model.layers)
print(f"  Frozen      : {total_layers} base layers  (no base weights updated)")

# ═══════════════════════════════════════════════════════════
# STEP 3 — Build new classification head
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 3/6 — Building new classification head")
print("═" * 60)

num_classes = len(all_classes)

x = base_model.output
x = layers.BatchNormalization(name="bn_head")(x)
x = layers.Dense(256, activation="relu", name="dense_head")(x)
x = layers.Dropout(0.4, name="dropout_head")(x)
output = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

new_model = Model(inputs=base_model.input, outputs=output, name="crop_disease_v2")

new_model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LR),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

trainable_count = sum(tf.size(w).numpy() for w in new_model.trainable_weights)
total_count     = sum(tf.size(w).numpy() for w in new_model.weights)

print(f"  Output classes      : {num_classes}")
print(f"  Trainable params    : {trainable_count:,}  (head only)")
print(f"  Non-trainable params: {total_count - trainable_count:,}  (frozen base)")

# ═══════════════════════════════════════════════════════════
# STEP 4 — Data generators
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 4/6 — Setting up data pipeline")
print("═" * 60)

# Moderate augmentation — good for 500-1000 images/class
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    zoom_range=0.15,
    brightness_range=[0.85, 1.15],
    fill_mode="nearest"
)

val_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2
)

train_gen = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True,
    seed=42
)

val_gen = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False,
    seed=42
)

print(f"  Training samples   : {train_gen.samples}")
print(f"  Validation samples : {val_gen.samples}")
print(f"  Classes detected   : {len(train_gen.class_indices)}")

if len(train_gen.class_indices) != num_classes:
    print(f"\n  WARNING: Expected {num_classes} classes but generator found {len(train_gen.class_indices)}.")
    print("  Check that all folders are directly inside DATASET_DIR.")

# ═══════════════════════════════════════════════════════════
# STEP 5 — Class weights
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 5/6 — Computing class weights")
print("═" * 60)

labels   = train_gen.classes
cw_array = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(labels),
    y=labels
)
class_weight_dict = dict(enumerate(cw_array))

# Extra 1.5x boost for all healthy classes to reduce misidentification
boosted = []
for idx, class_name in enumerate(train_gen.class_indices):
    if "healthy" in class_name.lower():
        class_weight_dict[idx] *= 1.5
        boosted.append(class_name)

print(f"  Balanced weights computed for {len(class_weight_dict)} classes.")
print(f"  Healthy boost (x1.5) applied to: {boosted}")

# ═══════════════════════════════════════════════════════════
# STEP 6 — Train
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  STEP 6/6 — Fine-tuning")
print("═" * 60)
print(f"  Old model  : {OLD_MODEL_PATH}")
print(f"  New model  : {NEW_MODEL_PATH}")
print(f"  Classes    : {len(existing_classes)} existing + {len(rice_classes)} rice = {num_classes} total")
print(f"  Epochs     : {EPOCHS}  (early stopping if val_acc plateaus)")
print(f"  Batch size : {BATCH_SIZE}")
print(f"  Mode       : CPU — base frozen, head only")
print("═" * 60 + "\n")

os.makedirs(os.path.dirname(NEW_MODEL_PATH), exist_ok=True)

callbacks = [
    ModelCheckpoint(
        NEW_MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),
    EarlyStopping(
        monitor="val_accuracy",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]

history = new_model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS,
    class_weight=class_weight_dict,
    callbacks=callbacks,
    verbose=1
)

# ═══════════════════════════════════════════════════════════
# Save updated classes.json and diseases_v2.json
# ═══════════════════════════════════════════════════════════
print("\n" + "═" * 60)
print("  Saving class files")
print("═" * 60)

# 1. Save simple classes list (same format as your original classes.json)
#    Sorted by index so order matches model output
new_classes_list = [None] * len(train_gen.class_indices)
for class_name, idx in train_gen.class_indices.items():
    new_classes_list[idx] = class_name

with open(OLD_CLASSES_JSON, "w") as f:
    json.dump(new_classes_list, f, indent=2)
print(f"  Updated classes.json  : {OLD_CLASSES_JSON}  ({len(new_classes_list)} classes)")

# 2. Save rich diseases_v2.json (merges old diseases.json + new Rice entries)
old_disease_map = {}
if os.path.exists(DISEASES_JSON):
    with open(DISEASES_JSON, "r") as f:
        old_diseases = json.load(f)
    old_disease_map = {d["class_name"]: d for d in old_diseases}
    print(f"  Loaded diseases.json  : {len(old_disease_map)} existing entries")
else:
    print(f"  WARNING: diseases.json not found at {DISEASES_JSON} — Rice entries only will be written.")

new_diseases = []
for class_name, idx in sorted(train_gen.class_indices.items(), key=lambda x: x[1]):
    if class_name in RICE_CLASS_INFO:
        info = RICE_CLASS_INFO[class_name]
        new_diseases.append({
            "id": idx,
            "class_name": class_name,
            "crop": "Rice",
            "disease": info["disease"],
            "description": info["description"],
            "symptoms": info["symptoms"],
            "treatment": info["treatment"],
            "prevention": info["prevention"],
            "severity": info["severity"],
            "is_healthy": info["is_healthy"]
        })
    elif class_name in old_disease_map:
        entry = dict(old_disease_map[class_name])
        entry["id"] = idx   # update index since class order may have shifted
        new_diseases.append(entry)
    else:
        # Fallback for any unexpected class
        parts   = class_name.split("___")
        crop    = parts[0].replace("_", " ") if len(parts) > 0 else class_name
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        new_diseases.append({
            "id": idx,
            "class_name": class_name,
            "crop": crop,
            "disease": disease,
            "description": f"{disease} on {crop}. Update in diseases_v2.json.",
            "symptoms": ["Update symptoms"],
            "treatment": ["Update treatment"],
            "prevention": ["Update prevention"],
            "severity": "Medium",
            "is_healthy": "healthy" in class_name.lower()
        })

os.makedirs(os.path.dirname(NEW_CLASSES_JSON), exist_ok=True)
with open(NEW_CLASSES_JSON, "w") as f:
    json.dump(new_diseases, f, indent=2)
print(f"  Saved diseases_v2.json: {NEW_CLASSES_JSON}  ({len(new_diseases)} entries)")

# ═══════════════════════════════════════════════════════════
# Plot and save training curves
# ═══════════════════════════════════════════════════════════
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history["accuracy"],     label="Train Acc")
plt.plot(history.history["val_accuracy"], label="Val Acc")
plt.title("Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history.history["loss"],     label="Train Loss")
plt.plot(history.history["val_loss"], label="Val Loss")
plt.title("Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)

plt.tight_layout()
plot_path = r"D:\proj\CDD\backend\model\training_curves_v2.png"
plt.savefig(plot_path)
plt.close()
print(f"  Training curves saved : {plot_path}")

# ═══════════════════════════════════════════════════════════
# Final summary
# ═══════════════════════════════════════════════════════════
best_val_acc = max(history.history["val_accuracy"])
best_epoch   = history.history["val_accuracy"].index(best_val_acc) + 1

print("\n" + "═" * 60)
print("  FINE-TUNING COMPLETE")
print("═" * 60)
print(f"  Best val accuracy : {best_val_acc * 100:.2f}%  (epoch {best_epoch})")
print(f"  Best model saved  : {NEW_MODEL_PATH}")
print(f"  Class list updated: {OLD_CLASSES_JSON}")
print(f"  Disease info saved: {NEW_CLASSES_JSON}")
print(f"  Training plot     : {plot_path}")
print()
print("  Next steps:")
print("  1. Open app.py")
print("  2. Change model path  →  crop_disease_model_v2.h5")
print("  3. Change diseases    →  diseases_v2.json")
print("  4. Test a rice leaf image in the app")
print("═" * 60)