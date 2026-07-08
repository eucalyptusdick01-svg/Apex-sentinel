"""Color Convert — Module 222. Usage: color_convert.py "#FF5733" or color_convert.py "rgb:255,87,51" or color_convert.py "hsl:9,100,60" """
import sys, re, colorsys

def hex_to_rgb(h: str):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    return f"#{r:02X}{g:02X}{b:02X}"

def rgb_to_hsl(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
    return round(h*360, 1), round(s*100, 1), round(l*100, 1)

def hsl_to_rgb(h, s, l):
    rgb = colorsys.hls_to_rgb(h/360, l/100, s/100)
    return tuple(round(c*255) for c in rgb)

def rgb_to_hsv(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    return round(h*360, 1), round(s*100, 1), round(v*100, 1)

def rgb_to_cmyk(r, g, b):
    if (r, g, b) == (0, 0, 0):
        return 0, 0, 0, 100
    r_, g_, b_ = r/255, g/255, b/255
    k = 1 - max(r_, g_, b_)
    c = (1 - r_ - k) / (1 - k)
    m = (1 - g_ - k) / (1 - k)
    y = (1 - b_ - k) / (1 - k)
    return round(c*100, 1), round(m*100, 1), round(y*100, 1), round(k*100, 1)

def luminance(r, g, b) -> float:
    def srgb(c):
        c /= 255
        return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*srgb(r) + 0.7152*srgb(g) + 0.0722*srgb(b)

def contrast_ratio(lum1, lum2) -> float:
    lighter = max(lum1, lum2)
    darker  = min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)

NAMED_COLORS = {
    "red":(255,0,0),"green":(0,128,0),"blue":(0,0,255),"white":(255,255,255),
    "black":(0,0,0),"yellow":(255,255,0),"cyan":(0,255,255),"magenta":(255,0,255),
    "orange":(255,165,0),"purple":(128,0,128),"pink":(255,192,203),
    "brown":(165,42,42),"gray":(128,128,128),"grey":(128,128,128),
    "lime":(0,255,0),"navy":(0,0,128),"teal":(0,128,128),"silver":(192,192,192),
    "gold":(255,215,0),"indigo":(75,0,130),"violet":(238,130,238),
}

def main():
    print("[MODULE 222] COLOR CONVERTER")
    print("[SOURCE]     Python colorsys stdlib — HEX/RGB/HSL/HSV/CMYK conversions")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  color_convert.py \"#FF5733\"")
        print("         color_convert.py \"rgb:255,87,51\"")
        print("         color_convert.py \"hsl:9,100,60\"")
        print("         color_convert.py \"orange\"")
        sys.exit(0)

    raw_lower = raw.lower().strip()
    r = g = b = 0

    try:
        if raw_lower.startswith("rgb:"):
            parts = raw[4:].split(",")
            r, g, b = int(parts[0]), int(parts[1]), int(parts[2])
        elif raw_lower.startswith("hsl:"):
            parts = raw[4:].split(",")
            r, g, b = hsl_to_rgb(float(parts[0]), float(parts[1]), float(parts[2]))
        elif raw_lower.startswith("hsv:"):
            parts = raw[4:].split(",")
            h_, s_, v_ = float(parts[0])/360, float(parts[1])/100, float(parts[2])/100
            rgb_ = colorsys.hsv_to_rgb(h_, s_, v_)
            r, g, b = round(rgb_[0]*255), round(rgb_[1]*255), round(rgb_[2]*255)
        elif raw_lower.startswith("cmyk:"):
            parts = raw[5:].split(",")
            c_, m_, y_, k_ = [float(p)/100 for p in parts]
            r = round(255*(1-c_)*(1-k_))
            g = round(255*(1-m_)*(1-k_))
            b = round(255*(1-y_)*(1-k_))
        elif raw_lower in NAMED_COLORS:
            r, g, b = NAMED_COLORS[raw_lower]
        elif raw.startswith("#") or re.match(r'^[0-9A-Fa-f]{3,8}$', raw):
            r, g, b = hex_to_rgb(raw)
        else:
            print(f"[ERROR] Unrecognized format: {raw!r}")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Parse error: {e}")
        sys.exit(1)

    # Clamp
    r, g, b = max(0,min(255,r)), max(0,min(255,g)), max(0,min(255,b))

    h_hex = rgb_to_hex(r, g, b)
    hsl   = rgb_to_hsl(r, g, b)
    hsv   = rgb_to_hsv(r, g, b)
    cmyk  = rgb_to_cmyk(r, g, b)
    lum   = luminance(r, g, b)
    cr_white = contrast_ratio(lum, 1.0)
    cr_black = contrast_ratio(lum, 0.0)

    print(f"[INPUT]    {raw}")
    print()
    print(f"[HEX]      {h_hex}")
    print(f"[RGB]      rgb({r}, {g}, {b})")
    print(f"[RGB %]    rgb({r/255*100:.1f}%, {g/255*100:.1f}%, {b/255*100:.1f}%)")
    print(f"[HSL]      hsl({hsl[0]}°, {hsl[1]}%, {hsl[2]}%)")
    print(f"[HSV]      hsv({hsv[0]}°, {hsv[1]}%, {hsv[2]}%)")
    print(f"[CMYK]     cmyk({cmyk[0]}%, {cmyk[1]}%, {cmyk[2]}%, {cmyk[3]}%)")
    print()
    print(f"[DECIMAL]  {r*65536 + g*256 + b}")
    print(f"[CSS]      {h_hex.lower()}")
    print(f"[CSS rgba] rgba({r}, {g}, {b}, 1.0)")
    print(f"[INTEGER]  {r},{g},{b}")
    print()
    print(f"[LUMINANCE]      {lum:.4f}  (0=black, 1=white)")
    print(f"[CONTRAST (white)] {cr_white:.2f}:1  {'✓ AA' if cr_white>=4.5 else '✗ fails AA'}")
    print(f"[CONTRAST (black)] {cr_black:.2f}:1  {'✓ AA' if cr_black>=4.5 else '✗ fails AA'}")

    # Complementary
    comp_h = (hsl[0] + 180) % 360
    comp_rgb = hsl_to_rgb(comp_h, hsl[1], hsl[2])
    print()
    print(f"[COMPLEMENTARY]  {rgb_to_hex(*comp_rgb)}  rgb{comp_rgb}")

    print()
    print("[DONE] Color conversion complete.")

if __name__ == "__main__":
    main()
