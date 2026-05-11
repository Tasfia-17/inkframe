"""Export storyboard frames as PDF."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from config import OUTPUTS_DIR


def generate_storyboard_pdf(project, scenes) -> Path:
    """Generate a PDF grid of storyboard frames with scene descriptions."""
    out_dir = OUTPUTS_DIR / str(project.id)
    pdf_path = out_dir / "storyboard.pdf"
    
    images = []
    for scene in scenes:
        if not scene.frame_path or not Path(scene.frame_path).exists():
            continue
        
        # Load frame
        img = Image.open(scene.frame_path).convert("RGB")
        img = img.resize((800, 450))  # Standardize size
        
        # Add text overlay
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        except:
            font = ImageFont.load_default()
            font_small = font
        
        # Scene number
        draw.rectangle([(10, 10), (150, 50)], fill=(0, 0, 0, 180))
        draw.text((20, 20), f"Scene {scene.index + 1}", fill="white", font=font)
        
        # Description at bottom
        desc = scene.description[:100] + "..." if len(scene.description) > 100 else scene.description
        draw.rectangle([(0, 400), (800, 450)], fill=(0, 0, 0, 200))
        draw.text((10, 410), desc, fill="white", font=font_small)
        
        images.append(img)
    
    if not images:
        raise ValueError("No frames to export")
    
    # Save as PDF
    images[0].save(pdf_path, save_all=True, append_images=images[1:], format="PDF")
    return pdf_path
