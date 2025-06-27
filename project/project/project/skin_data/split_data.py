import os, shutil, random
from pathlib import Path

BASE_DIR = Path(".")
OUTPUT_DIR = BASE_DIR / "processed"
SPLIT_RATIOS = (0.7, 0.15, 0.15)  # train, val, test

class_dirs = [d for d in BASE_DIR.iterdir() if d.is_dir() and d.name not in ("dermnet_raw", "processed", "__pycache__")]

for class_dir in class_dirs:
    images = list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.png")) + list(class_dir.glob("*.jpeg"))
    random.shuffle(images)
    total = len(images)
    n_train = int(SPLIT_RATIOS[0] * total)
    n_val = int(SPLIT_RATIOS[1] * total)

    splits = {
        "train": images[:n_train],
        "val": images[n_train:n_train + n_val],
        "test": images[n_train + n_val:]
    }

    for split, files in splits.items():
        target_dir = OUTPUT_DIR / split / class_dir.name
        target_dir.mkdir(parents=True, exist_ok=True)
        for f in files:
            shutil.copy(f, target_dir / f.name)

print("✅ Dataset split complete.")
