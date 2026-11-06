"""Makes the footer QR code as a small SVG and checks that it decodes back to the URL.
python3 qr.py <url> <out.svg>
Needs segno (pip install segno); the check also uses zxing-cpp and pillow if they are installed.
If pip is not allowed system-wide:  python3 -m venv .venv && .venv/bin/pip install segno zxing-cpp pillow
"""
import sys

try:
    import segno
except ImportError:
    sys.exit("segno is not installed: pip install segno (see the docstring for a venv)")

url, out = sys.argv[1], sys.argv[2]
qr = segno.make(url, error="m", micro=False)
# ink colour matches the pages; transparent background; viewBox so CSS can size it
svg = qr.svg_inline(dark="#231e16", light=None, border=2, scale=1, omitsize=True)
# xmlns is required when the file is used as an <img>
svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" ', 1)
open(out, "w").write(svg)

try:
    import io
    import zxingcpp
    from PIL import Image
    buf = io.BytesIO()
    qr.save(buf, kind="png", scale=8, border=4)
    found = [r.text for r in zxingcpp.read_barcodes(Image.open(buf))]
    print("decodes to:", found)
    if url not in found:
        sys.exit("QR check failed")
except ImportError:
    print("(zxing-cpp/pillow not installed: decode check skipped)")
print("wrote", out)
