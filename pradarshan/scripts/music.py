"""A soft background bed, made in code (nothing to license): warm pad + gentle electric piano + round bass.
70 BPM, Fmaj7 - Em7 - Dm7 - Cmaj7, one chord per bar, fade in and out.
python3 -I music.py <seconds> <out.wav> [transpose semitones] [seed]"""
import sys
import wave
import numpy as np

SR = 44100
DUR = float(sys.argv[1])
OUT = sys.argv[2]
SHIFT = int(sys.argv[3]) if len(sys.argv) > 3 else 0
SEED = int(sys.argv[4]) if len(sys.argv) > 4 else 7
BPM = 70
BAR = 4 * 60 / BPM
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(SEED)


def hz(midi):
    return 440.0 * 2 ** ((midi + SHIFT - 69) / 12)


# chords as MIDI notes (voiced low and close, so it stays calm)
CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
ROOTS = [41, 40, 38, 36]


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):            # one-pole filter: softens the edges of the pad
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def pad():
    out = np.zeros(N)
    for b in range(int(DUR / BAR) + 1):
        start, chord = b * BAR, CHORDS[b % 4]
        seg = (t >= start - .4) & (t < start + BAR + .8)
        tt = t[seg] - start
        env = np.clip((tt + .4) / 1.2, 0, 1) * np.clip((BAR + .8 - tt) / 1.2, 0, 1)
        for m in chord:
            for det in (-.6, .6):            # two slightly detuned voices per note for warmth
                f = hz(m) * 2 ** (det / 1200)
                out[seg] += env * np.sin(2 * np.pi * f * t[seg] + rng.uniform(0, 6.3)) * .05
    return lowpass(out, 900)


def epiano():
    out = np.zeros(N)
    beat = 60 / BPM
    pattern = [0, 2, 1, 3, 2, 1]             # a slow, gentle arpeggio on the chord tones
    for b in range(int(DUR / BAR) + 1):
        chord = CHORDS[b % 4]
        for k, idx in enumerate(pattern):
            start = b * BAR + k * beat * .66 + .05
            if start >= DUR:
                break
            f = hz(chord[idx] + 12)
            seg = (t >= start) & (t < start + 2.6)
            tt = t[seg] - start
            env = (1 - np.exp(-tt * 60)) * np.exp(-tt * 2.2)
            tone = np.sin(2 * np.pi * f * tt) + .25 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6)
            trem = 1 + .08 * np.sin(2 * np.pi * 4.5 * tt)
            out[seg] += env * tone * trem * (.075 if k else .1)
    return out


def bass():
    out = np.zeros(N)
    for b in range(int(DUR / BAR) + 1):
        start = b * BAR
        seg = (t >= start) & (t < start + BAR + .5)
        tt = t[seg] - start
        # a short release instead of a hard stop at the bar line (a hard stop clicks)
        env = (1 - np.exp(-tt * 20)) * np.exp(-tt * .9) * np.clip((BAR + .5 - tt) / .5, 0, 1)
        out[seg] += env * np.sin(2 * np.pi * hz(ROOTS[b % 4]) * tt) * .12
    return out


def main():
    mono = pad() + epiano() + bass()
    fade = np.clip(t / 2.5, 0, 1) * np.clip((DUR - t) / 3.5, 0, 1)
    left = mono * fade
    right = np.concatenate([np.zeros(int(.012 * SR)), mono[: N - int(.012 * SR)]]) * fade   # a little width
    stereo = np.stack([left, right], axis=1)
    stereo /= np.max(np.abs(stereo)) / .8
    with wave.open(OUT, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype('<i2').tobytes())
    print(f'wrote {OUT}: {DUR:.1f} s')


main()
