# save as convert_model.py in your backend folder
import tensorflow as tf

model = tf.keras.models.load_model("model/crop_disease_model_v2.h5")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open("model/crop_disease_model.tflite", "wb") as f:
    f.write(tflite_model)

print("Done! Size:", len(tflite_model) / 1024 / 1024, "MB")