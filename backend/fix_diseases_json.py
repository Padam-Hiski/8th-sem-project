"""
fix_diseases_json.py
--------------------
Run this ONCE after finetunemodel.py finishes training.
Training already completed (91.83% accuracy) — this just
generates the missing diseases_v2.json file.

Usage:
    cd D:\proj\CDD\backend
    .\tf_env\Scripts\Activate.ps1   (if not already active)
    python fix_diseases_json.py
"""

import json
import os

# ── paths ──────────────────────────────────────────────────
CLASSES_JSON     = r"D:\proj\CDD\backend\classes.json"           # already updated (44 classes)
DISEASES_JSON    = r"D:\proj\CDD\backend\database\diseases.json" # original rich info
NEW_CLASSES_JSON = r"D:\proj\CDD\backend\database\diseases_v2.json"

# ── Rice info ──────────────────────────────────────────────
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

# ── load classes.json (now has 44 classes) ─────────────────
with open(CLASSES_JSON, "r") as f:
    classes_list = json.load(f)

print(f"classes.json loaded: {len(classes_list)} classes")

# ── load diseases.json — handle both formats ───────────────
old_disease_map = {}
if os.path.exists(DISEASES_JSON):
    with open(DISEASES_JSON, "r") as f:
        old_diseases = json.load(f)

    if old_diseases and isinstance(old_diseases[0], dict):
        # Rich format: list of dicts with class_name key
        old_disease_map = {d["class_name"]: d for d in old_diseases}
        print(f"diseases.json loaded : {len(old_disease_map)} rich entries (dict format)")
    else:
        # Simple string list — no rich info, will use class name only
        print(f"diseases.json is a simple string list — existing classes will get basic entries")
        for i, class_name in enumerate(old_diseases):
            parts   = class_name.split("___")
            crop    = parts[0].replace("_", " ") if len(parts) > 0 else class_name
            disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
            old_disease_map[class_name] = {
                "class_name": class_name,
                "crop": crop,
                "disease": disease,
                "description": f"{disease} on {crop}.",
                "symptoms": ["See full disease guide"],
                "treatment": ["Consult local agricultural extension"],
                "prevention": ["Follow good agricultural practices"],
                "severity": "Medium",
                "is_healthy": "healthy" in class_name.lower()
            }
else:
    print(f"WARNING: diseases.json not found — all entries will be generated from class names")

# ── build diseases_v2.json ─────────────────────────────────
new_diseases = []
for idx, class_name in enumerate(classes_list):
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
        entry["id"] = idx
        new_diseases.append(entry)
    else:
        parts   = class_name.split("___")
        crop    = parts[0].replace("_", " ") if len(parts) > 0 else class_name
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        new_diseases.append({
            "id": idx,
            "class_name": class_name,
            "crop": crop,
            "disease": disease,
            "description": f"{disease} on {crop}.",
            "symptoms": ["See full disease guide"],
            "treatment": ["Consult local agricultural extension"],
            "prevention": ["Follow good agricultural practices"],
            "severity": "Medium",
            "is_healthy": "healthy" in class_name.lower()
        })

os.makedirs(os.path.dirname(NEW_CLASSES_JSON), exist_ok=True)
with open(NEW_CLASSES_JSON, "w") as f:
    json.dump(new_diseases, f, indent=2)

print(f"\n✓ diseases_v2.json saved: {NEW_CLASSES_JSON}")
print(f"  Total entries: {len(new_diseases)}")
print(f"  Rice entries : {sum(1 for d in new_diseases if d['crop'] == 'Rice')}")
print()
print("Next steps:")
print("  1. Update app.py → load crop_disease_model_v2.h5")
print("  2. Update app.py → load diseases_v2.json")
print("  3. Test a rice leaf image in the app")