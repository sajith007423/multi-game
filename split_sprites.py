import os
from PIL import Image

# Config
categories = ['animals', 'rpg', 'robots', 'characters', 'chinese', 'norse', 'greek']
base_dir = r'trainer/static/images'
sprite_size = 64

def split_sheet(category):
    sheet_path = os.path.join(base_dir, f'{category}.png')
    if not os.path.exists(sheet_path):
        print(f"Sheet not found: {sheet_path}")
        return

    try:
        img = Image.open(sheet_path)
        width, height = img.size
        
        # Determine cell size dynamically (assuming 4x4 grid)
        cell_w = width // 4
        cell_h = height // 4
        
        # Create output directory
        out_dir = os.path.join(base_dir, category)
        os.makedirs(out_dir, exist_ok=True)
        
        print(f"Processing {category} ({width}x{height}) -> Cell size {cell_w}x{cell_h}...")
        
        count = 0
        for y in range(0, height, cell_h):
            for x in range(0, width, cell_w):
                if count >= 16: break 
                
                box = (x, y, x + cell_w, y + cell_h)
                tile = img.crop(box)
                
                # Resize to 64x64 for consistency? 
                # Or keep high res? High res is better for "Standard Sprite" look users want.
                # But let's resize if it's huge, to save bandwidth? 
                # No, keep quality. CSS handles size.
                
                tile_path = os.path.join(out_dir, f'{count}.png')
                tile.save(tile_path)
                print(f"  Saved {tile_path}")
                count += 1
                
        print(f"Finished {category}, extracted {count} icons.")
        
    except Exception as e:
        print(f"Error processing {category}: {e}")

if __name__ == '__main__':
    for cat in categories:
        split_sheet(cat)
