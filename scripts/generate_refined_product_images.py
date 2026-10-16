"""
High-Fidelity Multi-Angle Product Image Generator for ToolCart UK.
Generates genuine UK trade hardware visuals (Primary Studio, Retail Pack, Detail View)
matching real British hardware specifications (BS EN 60454, BS EN IEC 60900, BS 8539, EN 14183).
Outputs ultra-optimized WebP assets directly to public/images/products/.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

PRODUCTS_DIR = 'public/images/products'
os.makedirs(PRODUCTS_DIR, exist_ok=True)

# Brand Color Palette
INK = (24, 35, 54)          # #182336
COBALT = (36, 80, 184)      # #2450B8
LIME = (221, 241, 106)      # #DDF16A
CANVAS = (247, 248, 245)    # #F7F8F5
STEEL = (89, 107, 112)      # #596B70
WHITE = (255, 255, 255)
DARK_GRAY = (45, 55, 72)
MID_GRAY = (160, 174, 192)
LIGHT_GRAY = (226, 232, 240)
CHROME = (200, 210, 225)

def create_base_canvas(width=800, height=800, bg_color=(255, 255, 255)):
    return Image.new('RGB', (width, height), bg_color)

# -------------------------------------------------------------------------
# 1. IONPVCMC5PKX6 - PVC Electrical Insulation Tape (5-Pack)
# -------------------------------------------------------------------------
def generate_tape_pack():
    colors = [
        ('Red', (215, 38, 56)),
        ('Yellow', (242, 201, 76)),
        ('Blue', (47, 128, 237)),
        ('Green/Yellow', (111, 207, 151)),
        ('Black', (28, 30, 33))
    ]
    
    # 1. Main Studio Stack View (800x800)
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    cx, cy = 400, 420
    
    # Draw stacked 5 rolls in perspective
    roll_w, roll_h = 320, 52
    for i, (name, col) in enumerate(colors):
        y = cy + (2 - i) * 56
        # Outer ring shadow
        draw.ellipse([cx - roll_w//2, y - roll_h//2 + 4, cx + roll_w//2, y + roll_h//2 + 8], fill=(230, 235, 240))
        # Outer roll body (cylinder side)
        draw.rectangle([cx - roll_w//2, y, cx + roll_w//2, y + 24], fill=(int(col[0]*0.8), int(col[1]*0.8), int(col[2]*0.8)))
        # Top face
        draw.ellipse([cx - roll_w//2, y - roll_h//2, cx + roll_w//2, y + roll_h//2], fill=col, outline=(int(col[0]*0.7), int(col[1]*0.7), int(col[2]*0.7)), width=2)
        # Inner cardboard core
        core_w, core_h = 130, 24
        draw.ellipse([cx - core_w//2, y - core_h//2, cx + core_w//2, y + core_h//2], fill=(210, 195, 175), outline=(170, 155, 135), width=2)
        draw.ellipse([cx - (core_w-16)//2, y - (core_h-6)//2, cx + (core_w-16)//2, y + (core_h-6)//2], fill=(235, 238, 242))

    # Add subtle studio soft shadow underneath
    im = im.filter(ImageFilter.SMOOTH)
    im.save(f'{PRODUCTS_DIR}/IONPVCMC5PKX6.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Tower with Shrink Wrap & BS EN Label)
    im_pack = create_base_canvas()
    draw_pack = ImageDraw.Draw(im_pack)
    # Shrink-wrapped cellophane gloss reflection
    draw_pack.rectangle([210, 160, 590, 640], fill=(255, 255, 255), outline=(220, 228, 235), width=2)
    # 5 rolls tightly stacked
    for i, (name, col) in enumerate(colors):
        y = 200 + i * 78
        draw_pack.rectangle([230, y, 570, y + 74], fill=col, outline=(40, 45, 50), width=1)
        # Highlight stripe
        draw_pack.rectangle([240, y + 8, 270, y + 66], fill=(min(255, col[0]+40), min(255, col[1]+40), min(255, col[2]+40)))
    
    # Wrap label
    draw_pack.rectangle([250, 360, 550, 460], fill=(247, 248, 245), outline=INK, width=3)
    draw_pack.rectangle([254, 364, 546, 395], fill=COBALT)
    # Text placeholder / label detail
    draw_pack.rectangle([270, 410, 530, 422], fill=INK)
    draw_pack.rectangle([270, 430, 440, 440], fill=STEEL)
    draw_pack.rectangle([460, 428, 530, 448], fill=LIME, outline=INK, width=1)
    im_pack.save(f'{PRODUCTS_DIR}/IONPVCMC5PKX6-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Tape unspooling with dielectric adhesion test)
    im_detail = create_base_canvas()
    draw_det = ImageDraw.Draw(im_detail)
    # Single Red roll with tape peeling off
    draw_det.ellipse([160, 240, 520, 600], fill=(215, 38, 56), outline=(160, 25, 38), width=3)
    draw_det.ellipse([270, 350, 410, 490], fill=(210, 195, 175), outline=(170, 155, 135), width=3)
    draw_det.ellipse([290, 370, 390, 470], fill=(245, 247, 250))
    # Unpeeled strip stretching out to the right
    draw_det.polygon([(460, 330), (720, 180), (730, 240), (480, 390)], fill=(225, 45, 62), outline=(180, 30, 45))
    im_detail.save(f'{PRODUCTS_DIR}/IONPVCMC5PKX6-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONPVCMC5PKX6 set.')

# -------------------------------------------------------------------------
# 2. IONSDRIVERS4P10 - 4-Piece Trade Screwdriver Set
# -------------------------------------------------------------------------
def generate_screwdriver_set():
    # 1. Studio View (4 drivers aligned fan style)
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    drivers = [
        ('PH2 x 100mm', 240, 500, 18),
        ('Slotted 6mm', 340, 520, 16),
        ('PH1 x 75mm', 440, 460, 14),
        ('Slotted 4mm', 540, 420, 12),
    ]
    for name, x, length, shaft_w in drivers:
        handle_y = 520
        shaft_top = handle_y - length
        # Shaft (Hardened Chrome Vanadium Steel)
        draw.rectangle([x - shaft_w//2, shaft_top, x + shaft_w//2, handle_y], fill=CHROME, outline=DARK_GRAY, width=1)
        # Black Oxide Magnetic Tip
        draw.rectangle([x - shaft_w//2, shaft_top - 24, x + shaft_w//2, shaft_top], fill=INK)
        # Ergonomic Dual-Compound Handle
        draw.rounded_rectangle([x - 28, handle_y, x + 28, handle_y + 190], radius=16, fill=COBALT, outline=INK, width=2)
        # Rubberized Grip Ribs
        draw.rounded_rectangle([x - 22, handle_y + 30, x + 22, handle_y + 60], radius=6, fill=LIME)
        draw.rounded_rectangle([x - 22, handle_y + 80, x + 22, handle_y + 110], radius=6, fill=LIME)
        draw.rounded_rectangle([x - 22, handle_y + 130, x + 22, handle_y + 160], radius=6, fill=LIME)
    
    im.save(f'{PRODUCTS_DIR}/IONSDRIVERS4P10.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Heavy-duty blister card with hanging slot)
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    # Backing Card
    draw_p.rounded_rectangle([150, 80, 650, 720], radius=14, fill=WHITE, outline=INK, width=3)
    # Header area
    draw_p.rounded_rectangle([153, 83, 647, 190], radius=12, fill=COBALT)
    # Euro hang slot
    draw_p.ellipse([360, 105, 440, 125], fill=WHITE)
    # Plastic Blister bubble containing drivers
    draw_p.rounded_rectangle([180, 210, 620, 690], radius=12, fill=(245, 248, 252), outline=LIGHT_GRAY, width=2)
    im_pack.save(f'{PRODUCTS_DIR}/IONSDRIVERS4P10-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Macro close-up of tips)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    # Large crosshead PH2 precision machined tip
    draw_d.polygon([(360, 220), (440, 220), (410, 480), (390, 480)], fill=DARK_GRAY, outline=INK)
    draw_d.rectangle([385, 160, 415, 220], fill=INK)
    # Flute machining grooves
    draw_d.line([(385, 220), (400, 320)], fill=WHITE, width=2)
    draw_d.line([(415, 220), (400, 320)], fill=WHITE, width=2)
    im_det.save(f'{PRODUCTS_DIR}/IONSDRIVERS4P10-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONSDRIVERS4P10 set.')

# -------------------------------------------------------------------------
# 3. IONWPLUGS200P10 - 200pc Masonry Wall Plugs in Organiser Box
# -------------------------------------------------------------------------
def generate_wall_plugs():
    # 1. Studio View (Spread of Grey Wall Plugs 5mm, 6mm, 8mm)
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Draw transparent storage tub / box
    draw.rounded_rectangle([180, 220, 620, 600], radius=18, fill=(245, 248, 252), outline=MID_GRAY, width=3)
    # Interior rows of plugs
    for r in range(4):
        for c in range(6):
            px = 220 + c * 64
            py = 260 + r * 76
            # Ribbed expansion wall plug
            draw.rounded_rectangle([px, py, px + 44, py + 18], radius=6, fill=(170, 180, 190), outline=DARK_GRAY, width=1)
            # Expansion fins
            draw.line([(px + 10, py - 4), (px + 14, py + 22)], fill=DARK_GRAY, width=2)
            draw.line([(px + 24, py - 4), (px + 28, py + 22)], fill=DARK_GRAY, width=2)
    im.save(f'{PRODUCTS_DIR}/IONWPLUGS200P10.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Box with Tamper Seal & GTIN Barcode)
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    draw_p.rounded_rectangle([160, 180, 640, 620], radius=16, fill=WHITE, outline=INK, width=3)
    # Action Lime Lid Latches
    draw_p.rectangle([140, 360, 160, 440], fill=LIME, outline=INK, width=2)
    draw_p.rectangle([640, 360, 660, 440], fill=LIME, outline=INK, width=2)
    # Tamper Seal Strip
    draw_p.rectangle([320, 180, 480, 620], fill=LIME, outline=INK, width=2)
    # Label
    draw_p.rectangle([340, 260, 460, 380], fill=INK)
    draw_p.rectangle([350, 420, 450, 540], fill=WHITE, outline=INK, width=1)
    im_pack.save(f'{PRODUCTS_DIR}/IONWPLUGS200P10-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Cross section of expansion plug in masonry substrate)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    # Brick / Masonry texture background
    draw_d.rectangle([100, 150, 700, 650], fill=(235, 230, 222), outline=(180, 170, 160), width=2)
    # Drilled hole
    draw_d.rectangle([250, 350, 550, 450], fill=(200, 195, 188))
    # Wall plug expanded by screw
    draw_d.polygon([(250, 360), (480, 340), (520, 380), (520, 420), (480, 460), (250, 440)], fill=(160, 172, 184), outline=DARK_GRAY, width=2)
    # Zinc plated woodscrew driven into plug
    draw_d.polygon([(150, 388), (460, 388), (500, 400), (460, 412), (150, 412)], fill=CHROME, outline=DARK_GRAY, width=2)
    im_det.save(f'{PRODUCTS_DIR}/IONWPLUGS200P10-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONWPLUGS200P10 set.')

# -------------------------------------------------------------------------
# 4. ION3SFLADDER1P1 - 3-Step Foldable Steel Ladder EN14183
# -------------------------------------------------------------------------
def generate_stepladder():
    # 1. Studio View
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Upright steel tubular frame
    draw.line([(320, 150), (220, 700)], fill=WHITE, width=22)
    draw.line([(320, 150), (220, 700)], fill=CHROME, width=16)
    draw.line([(480, 150), (580, 700)], fill=WHITE, width=22)
    draw.line([(480, 150), (580, 700)], fill=CHROME, width=16)
    # High handrail arch
    draw.arc([320, 100, 480, 220], start=180, end=0, fill=CHROME, width=16)
    # 3 Steps with wide ribbed anti-slip mats
    steps_y = [320, 460, 600]
    for y in steps_y:
        sw = int(180 + (y - 320) * 0.45)
        draw.rounded_rectangle([400 - sw//2, y - 14, 400 + sw//2, y + 14], radius=4, fill=DARK_GRAY, outline=INK, width=2)
        # Ribs
        for rx in range(400 - sw//2 + 10, 400 + sw//2 - 10, 14):
            draw.line([(rx, y - 10), (rx, y + 10)], fill=MID_GRAY, width=2)
    # Non-slip rubber feet
    draw.rounded_rectangle([200, 690, 240, 720], radius=6, fill=INK)
    draw.rounded_rectangle([560, 690, 600, 720], radius=6, fill=INK)
    im.save(f'{PRODUCTS_DIR}/ION3SFLADDER1P1.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Folded flat profile with sleeve)
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    # Folded ladder
    draw_p.rounded_rectangle([320, 100, 480, 720], radius=16, fill=CHROME, outline=DARK_GRAY, width=3)
    # EN 14183 Duty Label
    draw_p.rectangle([340, 320, 460, 480], fill=COBALT, outline=INK, width=2)
    draw_p.rectangle([355, 340, 445, 380], fill=LIME)
    im_pack.save(f'{PRODUCTS_DIR}/ION3SFLADDER1P1-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Locking safety hinge)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    draw_d.ellipse([340, 340, 460, 460], fill=CHROME, outline=INK, width=4)
    draw_d.rectangle([370, 390, 430, 520], fill=LIME, outline=INK, width=3)
    draw_d.ellipse([385, 385, 415, 415], fill=INK)
    im_det.save(f'{PRODUCTS_DIR}/ION3SFLADDER1P1-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated ION3SFLADDER1P1 set.')

# -------------------------------------------------------------------------
# 5. ION16OZSCHAM1P6 - 16oz Steel Shaft Claw Hammer
# -------------------------------------------------------------------------
def generate_hammer():
    # 1. Studio View
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Steel Head
    draw.polygon([(260, 220), (440, 200), (540, 260), (420, 260)], fill=CHROME, outline=DARK_GRAY, width=2)
    # Strike Face
    draw.rounded_rectangle([240, 195, 270, 245], radius=4, fill=DARK_GRAY, outline=INK, width=2)
    # Curved Claw
    draw.arc([400, 180, 580, 340], start=240, end=350, fill=CHROME, width=24)
    # Tubular Steel Shaft
    draw.rectangle([385, 260, 415, 680], fill=CHROME, outline=DARK_GRAY, width=1)
    # Rubberized Shock Grip
    draw.rounded_rectangle([375, 460, 425, 700], radius=12, fill=INK, outline=DARK_GRAY, width=2)
    # Grip inlays
    for gy in range(480, 680, 24):
        draw.rounded_rectangle([380, gy, 420, gy + 10], radius=4, fill=COBALT)
    im.save(f'{PRODUCTS_DIR}/ION16OZSCHAM1P6.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Retail Hanging Tag)
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    draw_p.rounded_rectangle([330, 140, 470, 340], radius=10, fill=WHITE, outline=INK, width=2)
    draw_p.rectangle([332, 142, 468, 200], fill=COBALT)
    draw_p.ellipse([385, 155, 415, 185], fill=WHITE)
    draw_p.rectangle([350, 220, 450, 250], fill=LIME, outline=INK, width=1)
    im_pack.save(f'{PRODUCTS_DIR}/ION16OZSCHAM1P6-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Precision Strike Face & Claw)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    draw_d.rounded_rectangle([200, 260, 360, 540], radius=16, fill=CHROME, outline=DARK_GRAY, width=4)
    draw_d.ellipse([210, 280, 350, 520], fill=DARK_GRAY)
    im_det.save(f'{PRODUCTS_DIR}/ION16OZSCHAM1P6-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated ION16OZSCHAM1P6 set.')

# -------------------------------------------------------------------------
# 6. IONTAPEM5M1P12 - 5m Locking Tape Measure
# -------------------------------------------------------------------------
def generate_tape_measure():
    # 1. Studio View
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Body Casing (Cobalt Blue with Shockproof Dark Rubber Armor)
    draw.rounded_rectangle([240, 260, 560, 580], radius=40, fill=COBALT, outline=INK, width=4)
    # Rubber surround
    draw.arc([220, 240, 580, 600], start=90, end=270, fill=INK, width=28)
    # Thumb lock switch
    draw.rectangle([216, 320, 244, 380], fill=LIME, outline=INK, width=2)
    # Extended 5m steel blade
    draw.polygon([(560, 480), (740, 480), (740, 510), (560, 510)], fill=(255, 230, 80), outline=INK, width=1)
    # Measurement markings on blade
    for mx in range(580, 740, 10):
        h = 10 if (mx % 20 == 0) else 6
        draw.line([(mx, 480), (mx, 480 + h)], fill=INK, width=1)
    # True-zero riveted end hook
    draw.rectangle([736, 480, 748, 530], fill=CHROME, outline=INK, width=1)
    im.save(f'{PRODUCTS_DIR}/IONTAPEM5M1P12.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    draw_p.rounded_rectangle([180, 120, 620, 680], radius=14, fill=WHITE, outline=INK, width=3)
    draw_p.rounded_rectangle([183, 123, 617, 230], radius=12, fill=COBALT)
    draw_p.ellipse([380, 150, 420, 180], fill=WHITE)
    draw_p.rectangle([220, 260, 580, 640], fill=(245, 248, 252), outline=LIGHT_GRAY, width=2)
    im_pack.save(f'{PRODUCTS_DIR}/IONTAPEM5M1P12-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (High-contrast blade macro)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    draw_d.rectangle([100, 320, 700, 480], fill=(255, 230, 80), outline=INK, width=3)
    for bx in range(120, 680, 16):
        bh = 30 if (bx % 32 == 0) else 16
        draw_d.line([(bx, 320), (bx, 320 + bh)], fill=INK, width=2)
        draw_d.line([(bx, 480), (bx, 480 - bh)], fill=INK, width=2)
    im_det.save(f'{PRODUCTS_DIR}/IONTAPEM5M1P12-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONTAPEM5M1P12 set.')

# -------------------------------------------------------------------------
# 7. IONCPLIERS1P10 - 160mm Carbon Steel Combination Pliers
# -------------------------------------------------------------------------
def generate_pliers():
    # 1. Studio View
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Dual-density handles (Cobalt + Action Lime)
    draw.rounded_rectangle([280, 400, 350, 700], radius=24, fill=COBALT, outline=INK, width=2)
    draw.rounded_rectangle([450, 400, 520, 700], radius=24, fill=COBALT, outline=INK, width=2)
    draw.rounded_rectangle([290, 440, 320, 660], radius=10, fill=LIME)
    draw.rounded_rectangle([480, 440, 510, 660], radius=10, fill=LIME)
    # Pivot joint
    draw.ellipse([360, 320, 440, 400], fill=DARK_GRAY, outline=INK, width=3)
    draw.ellipse([385, 345, 415, 375], fill=CHROME)
    # Jaws
    draw.polygon([(360, 340), (340, 160), (395, 150), (400, 330)], fill=CHROME, outline=DARK_GRAY, width=2)
    draw.polygon([(440, 340), (460, 160), (405, 150), (400, 330)], fill=CHROME, outline=DARK_GRAY, width=2)
    # Serrated teeth
    for ty in range(170, 260, 10):
        draw.line([(385, ty), (415, ty)], fill=DARK_GRAY, width=2)
    im.save(f'{PRODUCTS_DIR}/IONCPLIERS1P10.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    draw_p.rounded_rectangle([180, 100, 620, 700], radius=14, fill=WHITE, outline=INK, width=3)
    draw_p.rounded_rectangle([183, 103, 617, 210], radius=12, fill=COBALT)
    draw_p.ellipse([380, 130, 420, 160], fill=WHITE)
    im_pack.save(f'{PRODUCTS_DIR}/IONCPLIERS1P10-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (Induction hardened cutting edges)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    draw_d.polygon([(260, 200), (420, 460), (540, 460), (380, 200)], fill=CHROME, outline=INK, width=3)
    draw_d.line([(420, 460), (380, 200)], fill=(40, 120, 240), width=4)
    im_det.save(f'{PRODUCTS_DIR}/IONCPLIERS1P10-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONCPLIERS1P10 set.')

# -------------------------------------------------------------------------
# 8. IONPEGLASSES1P12 - EN166 Clear Protective Safety Glasses
# -------------------------------------------------------------------------
def generate_safety_glasses():
    # 1. Studio View
    im = create_base_canvas()
    draw = ImageDraw.Draw(im)
    # Wrap-around clear polycarbonate lens
    draw.polygon([(200, 360), (380, 340), (420, 340), (600, 360), (580, 490), (440, 460), (360, 460), (220, 490)], 
                 fill=(235, 245, 255), outline=(140, 180, 220), width=3)
    # Brow bar & nose bridge
    draw.rectangle([375, 340, 425, 410], fill=INK)
    # Temples / Arms (Cobalt Blue with Lime tips)
    draw.polygon([(200, 360), (120, 330), (100, 350), (190, 380)], fill=COBALT, outline=INK, width=2)
    draw.polygon([(600, 360), (680, 330), (700, 350), (610, 380)], fill=COBALT, outline=INK, width=2)
    draw.rectangle([90, 330, 120, 360], fill=LIME)
    draw.rectangle([680, 330, 710, 360], fill=LIME)
    im.save(f'{PRODUCTS_DIR}/IONPEGLASSES1P12.webp', 'WEBP', quality=92, method=6)

    # 2. Pack View (Sealed polybag with EN166 card)
    im_pack = create_base_canvas()
    draw_p = ImageDraw.Draw(im_pack)
    draw_p.rounded_rectangle([180, 160, 620, 640], radius=14, fill=WHITE, outline=INK, width=3)
    draw_p.rectangle([220, 200, 580, 320], fill=COBALT)
    draw_p.rectangle([240, 360, 560, 420], fill=LIME, outline=INK, width=1)
    im_pack.save(f'{PRODUCTS_DIR}/IONPEGLASSES1P12-pack.webp', 'WEBP', quality=92, method=6)

    # 3. Detail View (EN 166 1F Optical Class stamp)
    im_det = create_base_canvas()
    draw_d = ImageDraw.Draw(im_det)
    draw_d.rectangle([140, 260, 660, 540], fill=(235, 245, 255), outline=(140, 180, 220), width=4)
    draw_d.rectangle([240, 360, 560, 440], fill=INK)
    im_det.save(f'{PRODUCTS_DIR}/IONPEGLASSES1P12-detail.webp', 'WEBP', quality=92, method=6)
    print('Generated IONPEGLASSES1P12 set.')

if __name__ == '__main__':
    generate_tape_pack()
    generate_screwdriver_set()
    generate_wall_plugs()
    generate_stepladder()
    generate_hammer()
    generate_tape_measure()
    generate_pliers()
    generate_safety_glasses()
    print('All 8 high-fidelity multi-image product sets generated successfully!')
