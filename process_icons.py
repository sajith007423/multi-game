import os
from PIL import Image

# Configuration
# Source files are in the artifacts directory - I need to know the PATH.
# The user's system instructions say: C:\Users\sajit\.gemini\antigravity\brain\b81b30d7-eb35-4bb9-b276-8d7603eb5105
ARTIFACTS_DIR = r"C:\Users\sajit\.gemini\antigravity\brain\b81b30d7-eb35-4bb9-b276-8d7603eb5105"
TARGET_BASE_DIR = r"trainer/static/images"

# Map artifact name pattern to target folder
# Note: The actual filenames have timestamps appended, e.g. gems_icons_sheet_1765870129358.png
# We need to find the latest file matching the pattern.

config = [
    {"pattern": "gems_icons_sheet", "target": "gems"},
    {"pattern": "fruits_icons_sheet", "target": "fruits"},
    {"pattern": "candies_icons_sheet", "target": "candies"}
]

def find_latest_file(pattern):
    files = [f for f in os.listdir(ARTIFACTS_DIR) if f.startswith(pattern) and f.endswith(".png")]
    if not files:
        return None
    # Sort by name (timestamp is at end, so usually works) or modification time
    return max(files, key=lambda f: os.path.join(ARTIFACTS_DIR, f))

def slice_spritesheet(source_path, target_dir):
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created {target_dir}")
    
    try:
        img = Image.open(source_path)
        width, height = img.size
        # Assuming 4x4 grid
        cell_w = width / 4
        cell_h = height / 4
        
        print(f"Processing {source_path} ({width}x{height}) -> {target_dir}")
        
        count = 0
        for row in range(4):
            for col in range(4):
                left = col * cell_w
                top = row * cell_h
                right = left + cell_w
                bottom = top + cell_h
                
                crop = img.crop((left, top, right, bottom))
                # Resize if necessary? Let's keep resolution high for now (user liked high quality)
                # target filename: 0.png, 1.png...
                crop.save(os.path.join(target_dir, f"{count}.png"))
                count += 1
        print(f"Saved {count} icons to {target_dir}")
        return True
    except Exception as e:
        print(f"Error processing {source_path}: {e}")
        return False

def main():
    print("Starting asset processing...")
    for item in config:
        fname = find_latest_file(item["pattern"])
        if fname:
            src = os.path.join(ARTIFACTS_DIR, fname)
            tgt = os.path.join(TARGET_BASE_DIR, item["target"])
            slice_spritesheet(src, tgt)
        else:
            print(f"No artifact found for {item['pattern']}")

if __name__ == "__main__":
    main()
