# data is saved to drive cllaed processed_224x224

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator, img_to_array, load_img
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.metrics import TopKCategoricalAccuracy
import matplotlib.pyplot as plt
import numpy as np
import os
import collections
from imblearn.over_sampling import SMOTE

# --- Configuration ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 60 # This will be the max epochs over all phases
DATA_DIR = "/content/processed_224x224" # <<< ENSURE THIS PATH IS CORRECT
MODEL_NAME = "dermasense_model_smote_balanced.keras"
TRAIN_DIR = os.path.join(DATA_DIR, "train")
VAL_DIR = os.path.join(DATA_DIR, "val")
TEST_DIR = os.path.join(DATA_DIR, "test")

print(" Starting DermaSense SMOTE-BALANCED Training")
print(f"TensorFlow Version: {tf.__version__}")
print(f"Num GPUs Available: {len(tf.config.list_physical_devices('GPU'))}")

# ==============================================================================
# 1. DATA PREPARATION: APPLYING SMOTE TO THE TRAINING SET
# ==============================================================================

print("\n🌱 Loading training data into memory for SMOTE balancing...")

# --- Step 1.1: Load ALL training images into NumPy arrays ---
X_train_list = []
y_train_list = []
# Ensure class indices are created in a consistent, sorted order
class_names = sorted(os.listdir(TRAIN_DIR))
class_indices = {name: i for i, name in enumerate(class_names)}
print(f"Found class indices: {class_indices}")


for class_name, class_index in class_indices.items():
    class_path = os.path.join(TRAIN_DIR, class_name)
    if not os.path.isdir(class_path): continue

    for img_file in os.listdir(class_path):
        img_path = os.path.join(class_path, img_file)
        try:
            img = load_img(img_path, target_size=IMG_SIZE, interpolation='lanczos')
            img_array = img_to_array(img)
            X_train_list.append(img_array)
            y_train_list.append(class_index)
        except Exception as e:
            print(f"Warning: Could not load image {img_path}. Skipping. Error: {e}")

X_train = np.array(X_train_list, dtype=np.float32)
y_train = np.array(y_train_list)

print(f"\nOriginal Training Data Shape: {X_train.shape}")
print(f"Original Label Distribution: {sorted(collections.Counter(y_train).items())}")

# --- Step 1.2: Reshape, Preprocess, and Apply SMOTE ---
# Flatten images for SMOTE and apply the necessary preprocessing for the model
X_train_flat = X_train.reshape(len(X_train), -1)
# Apply model-specific preprocessing before balancing
X_train_processed_flat = tf.keras.applications.efficientnet.preprocess_input(X_train_flat)

print("\n🚀 Applying SMOTE... (This may take a few minutes)")
smote = SMOTE(random_state=42) # Removed n_jobs as it's not supported
X_train_smote_flat, y_train_smote = smote.fit_resample(X_train_processed_flat, y_train)

# --- Step 1.3: Reshape data back to image format ---
X_train_smote = X_train_smote_flat.reshape(len(X_train_smote_flat), *IMG_SIZE, 3)
y_train_smote_onehot = tf.keras.utils.to_categorical(y_train_smote, num_classes=len(class_indices))

print(f"\nBalanced Training Data Shape: {X_train_smote.shape}")
print(f"Balanced Label Distribution: {sorted(collections.Counter(y_train_smote).items())}")

# --- Step 1.4: Create Data Generators ---
# Create a new generator for the balanced training data that applies real-time augmentation
smote_train_datagen = ImageDataGenerator(
    rotation_range=40,
    width_shift_range=0.25,
    height_shift_range=0.25,
    horizontal_flip=True,
    zoom_range=0.2,
    shear_range=0.15,
    fill_mode='reflect',
    brightness_range=[0.7, 1.4],
    channel_shift_range=25.0
    # NOTE: NO preprocessing_function here, as it was already applied before SMOTE
)

smote_train_generator = smote_train_datagen.flow(
    X_train_smote,
    y_train_smote_onehot,
    batch_size=BATCH_SIZE
)

# Standard generators for validation and test sets (NO augmentation, just preprocessing)
val_datagen = ImageDataGenerator(preprocessing_function=tf.keras.applications.efficientnet.preprocess_input)
test_datagen = ImageDataGenerator(preprocessing_function=tf.keras.applications.efficientnet.preprocess_input)

val = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False,
    interpolation='lanczos'
)

test = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False,
    interpolation='lanczos'
)


# ==============================================================================
# 2. MODEL DEFINITION & LOSS FUNCTION
# ==============================================================================

# Custom Focal Loss (still useful for hard examples even with a balanced dataset)
class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, alpha=0.25, gamma=2.0, **kwargs):
        super().__init__(**kwargs)
        self.alpha = alpha
        self.gamma = gamma
    def call(self, y_true, y_pred):
        ce = tf.keras.losses.categorical_crossentropy(y_true, y_pred, from_logits=False)
        p_t = tf.exp(-ce)
        focal_loss = self.alpha * tf.pow(1 - p_t, self.gamma) * ce
        return tf.reduce_mean(focal_loss)

# Squeeze-and-Excitation Layer
class SEBlock(layers.Layer):
    def __init__(self, reduction=4, **kwargs):
        super(SEBlock, self).__init__(**kwargs)
        self.reduction = reduction
    def build(self, input_shape):
        self.channels = input_shape[-1]
        self.gap = layers.GlobalAveragePooling2D()
        self.squeeze = layers.Dense(self.channels // self.reduction, activation='relu')
        self.excite = layers.Dense(self.channels, activation='sigmoid')
        super(SEBlock, self).build(input_shape)
    def call(self, inputs):
        se = self.gap(inputs)
        se = self.squeeze(se)
        se = self.excite(se)
        se = layers.Reshape((1, 1, self.channels))(se)
        return layers.Multiply()([inputs, se])

# --- Model Architecture (EfficientNetB1 with SEBlock) ---
base_model = tf.keras.applications.EfficientNetB1(
    weights='imagenet',
    include_top=False,
    input_shape=(*IMG_SIZE, 3)
)
base_model.trainable = False

inputs = base_model.input
x = base_model.output
x = SEBlock(reduction=4, name='se_attention')(x)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(384, activation='swish')(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.25)(x)
x = layers.Dense(192, activation='swish')(x)
x = layers.Dropout(0.15)(x)
outputs = layers.Dense(len(class_indices), activation='softmax')(x)

model = tf.keras.Model(inputs=inputs, outputs=outputs)
model.summary()

# ==============================================================================
# 3. CALLBACKS & COMPILATION
# ==============================================================================

early_stop = EarlyStopping(monitor='val_top_2_accuracy', patience=15, restore_best_weights=True, verbose=1, min_delta=0.001, mode='max')
reduce_lr = ReduceLROnPlateau(monitor='val_top_2_accuracy', factor=0.2, patience=8, min_lr=1e-7, verbose=1, mode='max')
checkpoint = ModelCheckpoint('best_' + MODEL_NAME, monitor='val_top_2_accuracy', save_best_only=True, verbose=1, mode='max')

class BestMetricsCallback(tf.keras.callbacks.Callback):
    def on_train_begin(self, logs=None):
        self.best_top2 = 0
        self.best_top1 = 0
    def on_epoch_end(self, epoch, logs=None):
        val_top2 = logs.get('val_top_2_accuracy', 0)
        val_acc = logs.get('val_accuracy', 0)
        if val_top2 > self.best_top2:
            self.best_top2 = val_top2
            print(f"\n NEW BEST TOP-2: {val_top2:.4f}")
        if val_acc > self.best_top1:
            self.best_top1 = val_acc
            print(f"\n NEW BEST TOP-1: {val_acc:.4f}")

callbacks = [early_stop, reduce_lr, checkpoint, BestMetricsCallback()]

# ==============================================================================
# 4. TRAINING STRATEGY
# ==============================================================================

# --- Phase 1: Frozen Base Model Training ---
print("\n Phase 1: Training classifier on frozen base model...")
optimizer_phase1 = tf.keras.optimizers.AdamW(learning_rate=0.001, weight_decay=0.0001)
model.compile(optimizer=optimizer_phase1, loss=FocalLoss(), metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')])

history_phase1 = model.fit(
    smote_train_generator,
    epochs=25,
    validation_data=val,
    callbacks=callbacks,
    verbose=1
    # IMPORTANT: class_weight is REMOVED because the dataset is now balanced by SMOTE
)



##### stopped phase1 after epoch 13 due to overfitting, so we will continue from here

# --- Phase 2: Gradual Unfreezing ---
print("\n🔧 Phase 2: Gradual unfreezing strategy...")
total_epochs_start = 25
unfreeze_schedule = [15, 25, 35]

for i, unfreeze_layers in enumerate(unfreeze_schedule):
    print(f"\n🔧 Phase 2.{i+1}: Unfreezing last {unfreeze_layers} layers...")

    base_model.trainable = True
    for layer in base_model.layers[:-unfreeze_layers]:
        layer.trainable = False

    lr = 0.0001 / (i + 1) # Progressively smaller learning rate
    print(f"Re-compiling model with learning rate: {lr}")
    optimizer_fine_tune = tf.keras.optimizers.AdamW(learning_rate=lr, weight_decay=0.0001)
    model.compile(optimizer=optimizer_fine_tune, loss=FocalLoss(), metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')])

    epochs_this_phase = 12
    history_fine_tune = model.fit(
        smote_train_generator,
        epochs=total_epochs_start + epochs_this_phase,
        validation_data=val,
        callbacks=callbacks,
        initial_epoch=total_epochs_start,
        verbose=1
    )
    total_epochs_start += epochs_this_phase

print("\n SMOTE-BALANCED TRAINING COMPLETE!")

# ==============================================================================
# 5. FINAL EVALUATION
# ==============================================================================
print("\n" + "="*50)
print(" FINAL EVALUATION ON TEST SET")
print("="*50)

# Load the best performing model saved by the checkpoint
print("Loading best model weights from training...")
model.load_weights('best_' + MODEL_NAME)

test_results = model.evaluate(test, verbose=1)
print(f"\n FINAL RESULTS:")
print(f"Test Accuracy (Top-1): {test_results[1]:.4f} ({test_results[1]*100:.2f}%)")
print(f"Test Top-2 Accuracy:   {test_results[2]:.4f} ({test_results[2]*100:.2f}%)")
print(f"Test Loss:             {test_results[0]:.4f}")