# Film-grain tile (512x512, mean 128) for an overlay blend layer. Fixed seed -> deterministic.
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
a = rng.normal(128, 90, (512, 512))
# make it tile seamlessly: wrap-blur by padding
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L")
pad = 8
big = Image.new("L", (512 + 2 * pad, 512 + 2 * pad))
for dx in (-1, 0, 1):
    for dy in (-1, 0, 1):
        big.paste(img, (pad + dx * 512, pad + dy * 512))
big = big.filter(ImageFilter.GaussianBlur(0.75))
out = big.crop((pad, pad, pad + 512, pad + 512))
out.save("../composition/assets/img/grain.png", optimize=True)
arr = np.asarray(out, dtype=float)
print("grain mean", arr.mean().round(1), "std", arr.std().round(1))
