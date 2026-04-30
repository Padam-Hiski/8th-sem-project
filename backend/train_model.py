import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ---- SETTINGS ----
DATASET_PATH = r"D:\proj\CDD\backend\dataset\plantvillage dataset\color"
IMAGE_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10

# ---- LOAD CLASS NAMES ----
with open("backend/classes.json", "r") as f:
    classes = json.load(f)
NUM_CLASSES = len(classes)
print(f"Total classes: {NUM_CLASSES}")

# ---- DATA GENERATORS ----
# This loads images in batches instead of all at once
print("\nSetting up data generators...")

datagen = ImageDataGenerator(
    rescale=1./255,          # normalize 0-1
    validation_split=0.2,    # 80% train 20% test
    horizontal_flip=True,    # augmentation
    zoom_range=0.2,          # augmentation
    rotation_range=15        # augmentation
)

train_generator = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

val_generator = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

# Save correct class order from generator
classes_from_generator = list(train_generator.class_indices.keys())
with open("backend/classes.json", "w") as f:
    json.dump(classes_from_generator, f, indent=2)
print(f"Classes saved: {len(classes_from_generator)}")

# ---- BUILD MODEL ----
print("\nBuilding model...")
base_model = MobileNetV2(
    input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(128, activation="relu")(x)
output = Dense(NUM_CLASSES, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=output)

# ---- COMPILE ----
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
model.summary()

# ---- TRAIN ----
print("\nTraining started...")
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS
)

# ---- SAVE MODEL ----
os.makedirs("backend/model", exist_ok=True)
model.save("backend/model/crop_disease_model.h5")
print("\nModel saved!")

# ---- FINAL ACCURACY ----
loss, accuracy = model.evaluate(val_generator)
print(f"\nFinal Test Accuracy: {accuracy * 100:.2f}%")