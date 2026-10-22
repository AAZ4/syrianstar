"""Verkleinert die Texturen in GLB-Modellen (PNG → JPEG, max. 1024 px).

Die Higgsfield-Modelle enthalten je eine ~1 MB große PNG-Textur. Das macht die Theke
beim ersten Laden langsam (Download + Dekodieren). Aufruf:

    python tools/glb-texturen-verkleinern.py assets/models/halawet.glb [...]
"""
import io
import json
import struct
import sys

from PIL import Image


def shrink(path, max_px=1024, quality=85):
    data = open(path, 'rb').read()
    magic, version, _ = struct.unpack('<III', data[:12])
    assert magic == 0x46546C67, 'keine GLB-Datei'
    jlen, _ = struct.unpack('<II', data[12:20])
    gltf = json.loads(data[20:20 + jlen])
    off = 20 + jlen
    blen, _ = struct.unpack('<II', data[off:off + 8])
    bin_ = data[off + 8:off + 8 + blen]

    views = gltf['bufferViews']
    chunks = [bin_[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
    for img in gltf.get('images', []):
        if 'bufferView' not in img:
            continue
        i = img['bufferView']
        im = Image.open(io.BytesIO(chunks[i]))
        has_alpha = im.mode in ('RGBA', 'LA') and im.getchannel('A').getextrema()[0] < 250
        im.thumbnail((max_px, max_px), Image.LANCZOS)
        buf = io.BytesIO()
        if has_alpha:
            im.save(buf, 'PNG', optimize=True)
        else:
            im.convert('RGB').save(buf, 'JPEG', quality=quality, optimize=True, progressive=True)
            img['mimeType'] = 'image/jpeg'
        chunks[i] = buf.getvalue()

    # Binärteil neu zusammensetzen (4-Byte-Ausrichtung)
    out = bytearray()
    for v, c in zip(views, chunks):
        while len(out) % 4:
            out.append(0)
        v['byteOffset'] = len(out)
        v['byteLength'] = len(c)
        out += c
    while len(out) % 4:
        out.append(0)
    gltf['buffers'][0]['byteLength'] = len(out)

    js = json.dumps(gltf, separators=(',', ':')).encode()
    while len(js) % 4:
        js += b' '
    total = 12 + 8 + len(js) + 8 + len(out)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
        f.write(struct.pack('<II', len(out), 0x004E4942) + bytes(out))
    print(f'{path}: {len(data) // 1024} KB -> {total // 1024} KB')


if __name__ == '__main__':
    for p in sys.argv[1:]:
        shrink(p)
