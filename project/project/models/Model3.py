import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, CosineRestartScheduler
from tensorflow.keras.metrics import TopKCategoricalAccuracy
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
import numpy as np
import os

# --- Enhanced Config ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 60
DATA_DIR = "/content/processed_fixed/processed"
MODEL_NAME = "dermasense_model_boundary_push.keras"

print("🚀 Starting DermaSense BOUNDARY PUSHING Training")

# --- ADVANCED Data Augmentation Pipeline ---
# Custom augmentation function for medical images
def advanced_medical_augment(image):
    """Advanced augmentation specifically for dermatology images"""
    # Random color temperature adjustment (common in medical imaging)
    if tf.random.uniform([]) > 0.5:
        image = tf.image.adjust_hue(image, tf.random.uniform([], -0.1, 0.1))
    
    # Random saturation (skin tone variations)
    if tf.random.uniform([]) > 0.5:
        image = tf.image.adjust_saturation(image, tf.random.uniform([], 0.7, 1.3))
    
    # Gaussian noise (simulate camera noise)
    if tf.random.uniform([]) > 0.7:
        noise = tf.random.normal(tf.shape(image), stddev=0.02)
        image = tf.clip_by_value(image + noise, 0.0, 1.0)
    
    return image

train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    # Enhanced geometric augmentations
    rotation_range=40,           # Increased from 20
    width_shift_range=0.25,      # Increased from 0.2
    height_shift_range=0.25,
    horizontal_flip=True,
    zoom_range=0.2,              # Increased from 0.15
    shear_range=0.15,            # Increased from 0.1
    fill_mode='reflect',         # Better than 'nearest' for medical images
    brightness_range=[0.7, 1.4], # Wider range
    channel_shift_range=25,      # Color channel variations
    # Custom preprocessing
    preprocessing_function=lambda x: advanced_medical_augment(
        tf.keras.applications.efficientnet.preprocess_input(x)
    )
)

val_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

test_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

# Load datasets with enhanced parameters
train = train_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "train"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True,
    interpolation='lanczos'  # Higher quality resampling
)

val = val_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "val"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False,
    interpolation='lanczos'
)

test = test_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "test"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False,
    interpolation='lanczos'
)

# --- Enhanced Class Weights with Focal Loss ---
class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(train.classes),
    y=train.classes
)
class_weight_dict = dict(enumerate(class_weights))

# Custom Focal Loss for better handling of difficult cases
class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, alpha=0.25, gamma=2.0, **kwargs):
        super().__init__(**kwargs)
        self.alpha = alpha
        self.gamma = gamma
    
    def call(self, y_true, y_pred):
        # Compute focal loss
        ce = tf.keras.losses.categorical_crossentropy(y_true, y_pred)
        p_t = tf.exp(-ce)
        focal_loss = self.alpha * tf.pow(1 - p_t, self.gamma) * ce
        return focal_loss

# --- ENHANCED Model Architecture ---
# Try EfficientNetB1 for better feature extraction
base_model = tf.keras.applications.EfficientNetB1(  # Upgraded from B0
    weights='imagenet',
    include_top=False,
    input_shape=(*IMG_SIZE, 3)
)
base_model.trainable = False

# Enhanced model with attention mechanism
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    
    # Squeeze-and-Excitation-like attention
    layers.Dense(base_model.output_shape[-1] // 4, activation='relu', name='attention_squeeze'),
    layers.Dense(base_model.output_shape[-1], activation='sigmoid', name='attention_excite'),
    layers.Multiply(),
    
    # Optimized classifier head (keeping it simple but enhanced)
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    layers.Dense(384, activation='swish'),  # Swish activation for better gradients
    layers.BatchNormalization(),
    layers.Dropout(0.25),
    layers.Dense(192, activation='swish'),
    layers.Dropout(0.15),
    layers.Dense(train.num_classes, activation='softmax')
])

# Enhanced optimizer with weight decay
optimizer = tf.keras.optimizers.AdamW(
    learning_rate=0.001,
    weight_decay=0.0001  # L2 regularization through optimizer
)

model.compile(
    optimizer=optimizer,
    loss=FocalLoss(alpha=0.25, gamma=2.0),  # Focal loss instead of categorical crossentropy
    metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
)

# --- ADVANCED Callbacks ---
# Cosine annealing with warm restarts
cosine_scheduler = tf.keras.experimental.CosineDecayRestarts(
    initial_learning_rate=0.001,
    first_decay_steps=len(train) * 5,  # 5 epochs
    t_mul=2.0,
    m_mul=0.9,
    alpha=0.0001
)

early_stop = EarlyStopping(
    monitor='val_top_2_accuracy',  # Monitor top-2 since that's our target
    patience=15,
    restore_best_weights=True,
    verbose=1,
    min_delta=0.001,
    mode='max'
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_top_2_accuracy',
    factor=0.2,
    patience=8,
    min_lr=1e-7,
    verbose=1,
    mode='max'
)

checkpoint = ModelCheckpoint(
    'best_' + MODEL_NAME,
    monitor='val_top_2_accuracy',  # Save based on top-2 accuracy
    save_best_only=True,
    verbose=1,
    mode='max'
)

# Custom callback to track best metrics
class BestMetricsCallback(tf.keras.callbacks.Callback):
    def __init__(self):
        self.best_top2 = 0
        self.best_top1 = 0
    
    def on_epoch_end(self, epoch, logs=None):
        val_top2 = logs.get('val_top_2_accuracy', 0)
        val_acc = logs.get('val_accuracy', 0)
        
        if val_top2 > self.best_top2:
            self.best_top2 = val_top2
            print(f"\n🎯 NEW BEST TOP-2: {val_top2:.4f}")
        
        if val_acc > self.best_top1:
            self.best_top1 = val_acc
            print(f"\n🎯 NEW BEST TOP-1: {val_acc:.4f}")

callbacks = [early_stop, reduce_lr, checkpoint, BestMetricsCallback()]

# --- Enhanced Training Strategy ---

# Phase 1: Initial training with frozen base (extended)
print("🎯 Phase 1: Enhanced frozen base model training...")
history_phase1 = model.fit(
    train,
    epochs=25,  # Increased from 20
    validation_data=val,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    verbose=1
)

# Phase 2: Gradual unfreezing (NEW STRATEGY)
print("🔧 Phase 2: Gradual unfreezing strategy...")

# Unfreeze top layers gradually
for i, unfreeze_layers in enumerate([15, 25, 35]):  # Gradual unfreezing
    print(f"🔧 Phase 2.{i+1}: Unfreezing last {unfreeze_layers} layers...")
    
    base_model.trainable = True
    for layer in base_model.layers[:-unfreeze_layers]:
        layer.trainable = False
    
    # Compile with progressively lower learning rates
    lr = 0.0001 / (i + 1)  # 0.0001, 0.00005, 0.000033
    model.compile(
        optimizer=tf.keras.optimizers.AdamW(learning_rate=lr, weight_decay=0.0001),
        loss=FocalLoss(alpha=0.25, gamma=2.0),
        metrics=['accuracy', TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
    )
    
    # Train for fewer epochs per phase
    phase_history = model.fit(
        train,
        epochs=12,  # 12 epochs per gradual phase
        validation_data=val,
        callbacks=callbacks,
        class_weight=class_weight_dict,
        initial_epoch=25 + (i * 12),
        verbose=1
    )

print("🚀 BOUNDARY PUSHING TRAINING COMPLETE!")

# --- Enhanced Evaluation ---
print("\n" + "="*50)
print("🎯 FINAL EVALUATION")
print("="*50)

# Load best model
model.load_weights('best_' + MODEL_NAME)

# Detailed test evaluation
test_results = model.evaluate(test, verbose=1)
print(f"\n🏆 FINAL RESULTS:")
print(f"Test Accuracy (Top-1): {test_results[1]:.4f} ({test_results[1]*100:.2f}%)")
print(f"Test Top-2 Accuracy:   {test_results[2]:.4f} ({test_results[2]*100:.2f}%)")
print(f"Test Loss:             {test_results[0]:.4f}")

# Target achievement check
if test_results[2] > 0.90:
    print("🎉 BREAKTHROUGH! Achieved 90%+ Top-2 Accuracy!")
elif test_results[2] > 0.88:
    print("🔥 EXCELLENT! Improved beyond previous best!")
else:
    print("📈 Good progress! Consider further optimization.")

print(f"\n📊 Improvement over original model:")
print(f"Top-2 Accuracy: {test_results[2]:.4f} vs 0.8781 = {((test_results[2]/0.8781 - 1)*100):+.2f}%")