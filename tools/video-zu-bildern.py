# Zerlegt ein 360°-Drehvideo (z. B. aus Kling) in Einzelbilder für das Stück-Fenster.
#   python tools/video-zu-bildern.py bilder/kling/kunefe.mp4 assets/spin/kunefe 72
# Ergebnis: 000.webp … 071.webp (gleichmäßig über das Video verteilt, max. 1000 px breit)
import sys, os, cv2
from PIL import Image

src, out, count = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 72
os.makedirs(out, exist_ok=True)
cap = cv2.VideoCapture(src)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
if total < count:
    sys.exit(f'Video hat nur {total} Bilder, gewünscht {count}')
for i in range(count):
    cap.set(cv2.CAP_PROP_POS_FRAMES, round(i * (total - 1) / count))   # letztes Bild = Startbild, daher auslassen
    ok, frame = cap.read()
    if not ok:
        sys.exit(f'Bild {i} konnte nicht gelesen werden')
    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    img.thumbnail((1000, 1000))
    img.save(os.path.join(out, f'{i:03d}.webp'), 'WEBP', quality=80, method=6)
print(f'{count} Bilder aus {total} Videobildern gespeichert in {out}')
