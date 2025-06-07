import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.metrics import TopKCategoricalAccuracy
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import os

# --- Config ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
DATA_DIR = "/content/processed_fixed/processed"
MODEL_NAME = "dermasense_model_final.keras"

print("🚀 Starting DermaSense Model Training (Improved Optimized Version)")

# --- Improved Data Augmentation ---
train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    rotation_range=30,
    width_shift_range=0.3,
    height_shift_range=0.3,
    horizontal_flip=True,
    vertical_flip=False,
    zoom_range=0.25,
    shear_range=0.15,
    brightness_range=[0.7, 1.3],
    channel_shift_range=20,
    fill_mode='reflect'
)

val_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)
test_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

# --- Load Data ---
train = train_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "train"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)
val = val_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "val"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)
test = test_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "test"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

# --- Class Weights ---
class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(train.classes),
    y=train.classes
)
class_weight_dict = dict(enumerate(class_weights))

# --- Model ---
base_model = tf.keras.applications.EfficientNetB0(
    weights='imagenet',
    include_top=False,
    input_shape=(*IMG_SIZE, 3)
)
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(512, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.1),
    layers.Dense(train.num_classes, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
)

# --- Callbacks ---
early_stop = EarlyStopping(
    monitor='val_accuracy',
    patience=12,
    restore_best_weights=True,
    verbose=1,
    min_delta=0.001
)
reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.2,
    patience=6,
    min_lr=1e-6,
    verbose=1
)
checkpoint = ModelCheckpoint(
    'best_' + MODEL_NAME,
    monitor='val_accuracy',
    save_best_only=True,
    verbose=1
)

callbacks = [early_stop, reduce_lr, checkpoint]

# --- Phase 1: Initial Training ---
print("🎯 Phase 1: Frozen base model training...")
history_phase1 = model.fit(
    train,
    epochs=30,
    validation_data=val,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    verbose=1
)

# --- Phase 2: Fine-Tuning ---
print("🔧 Phase 2: Fine-tuning last 30 layers...")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
)

history_phase2 = model.fit(
    train,
    epochs=60,
    validation_data=val,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    initial_epoch=30,
    verbose=1
)

# --- Final Evaluation ---
test_results = model.evaluate(test, verbose=1)
print(f"Test Accuracy: {test_results[1]:.4f}")
print(f"Test Top-2 Accuracy: {test_results[2]:.4f}")
