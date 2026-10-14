# Zerlegt ein 360°-Drehvideo (z. B. aus Kling) in Einzelbilder für das Stück-Fenster.
#   python tools/video-zu-bildern.py bilder/kling/kunefe.mp4 assets/spin/kunefe 72 [crop]
#   crop = links,oben,rechts,unten als Anteil, z. B. 0.05,0.06,0.95,0.92 (schneidet Wasserzeichen weg)
# Ergebnis: 000.webp … 071.webp (gleichmäßig über das Video verteilt, max. 1000 px breit)
import sys, os, cv2
from PIL import Image

src, out, count = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 72
crop = [float(v) for v in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
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
    if crop:
        w, h = img.size
        img = img.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    img.thumbnail((960, 960))
    img.save(os.path.join(out, f'{i:03d}.webp'), 'WEBP', quality=74, method=6)
print(f'{count} Bilder aus {total} Videobildern gespeichert in {out}')
