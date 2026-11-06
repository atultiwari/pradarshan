"""Write a prompt pack for one illustration, so any image source can make it: a paid tool connected to Claude, or the
user by hand in ChatGPT, Gemini or any image chat (references/illustrated-people.md, "Choose the image source").

python3 <skill>/scripts/people/prompt_pack.py <id> --ref refs/<id>.png --prompt "..." [--also cast.png ...] [--app "ChatGPT"]

Run from the project folder. Writes assets/generated/requests/<id>/ with ref.png, the extra references (numbered in
the order the prompt names them), prompt.txt and README.txt. The result goes to assets/generated/<id>.png.
"""
import argparse
import shutil
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('id')
ap.add_argument('--ref', required=True, help='the pose reference picture (FIRST reference)')
ap.add_argument('--also', nargs='*', default=[], help='further references, e.g. the cast sheet (SECOND, THIRD, ...)')
ap.add_argument('--prompt', required=True)
ap.add_argument('--app', default='ChatGPT or Gemini')
a = ap.parse_args()

out = Path('assets/generated/requests') / a.id
out.mkdir(parents=True, exist_ok=True)
names = ['1-first-ref.png']
shutil.copy(a.ref, out / names[0])
for i, p in enumerate(a.also, start=2):
    n = f'{i}-ref-{Path(p).name}'
    shutil.copy(p, out / n); names.append(n)
prompt = a.prompt.strip()
if 'white background' not in prompt.lower():
    prompt += ' Plain white background, no floor, no shadow, no text.'
(out / 'prompt.txt').write_text(prompt + '\n')
(out / 'README.txt').write_text(f"""Illustration {a.id}

1. Open {a.app} (any image chat that accepts reference images).
2. Attach these pictures, in this order: {', '.join(names)}.
   The prompt calls them FIRST, SECOND, ... in that order.
3. Paste the text of prompt.txt and send. Ask for a landscape 3:2 image.
4. Download the result and save it as: assets/generated/{a.id}.png
5. Tell Claude "{a.id} is in". Claude checks it against the source, removes the white background and places it.
   If it is wrong, Claude writes a corrected prompt for the next try.
""")
print('wrote', out)
