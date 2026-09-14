"""Synthesize Layak's demo narration with Kokoro or a cloned Chatterbox voice.

The models live outside the repository. Both supported engines have permissive
licenses: Kokoro is Apache 2.0 and Chatterbox is MIT.
"""

import os
import sys
from pathlib import Path


# Models live outside the repo: Kokoro alone is 311 MB and has no business in a git
# checkout. XDG-style default rather than a personal folder, so it is the same path
# on every machine. KOKORO_HOME overrides it.
def _resolve_kokoro_home() -> Path:
    if 'KOKORO_HOME' in os.environ:
        return Path(os.environ['KOKORO_HOME'])
    default_dir = Path.home() / '.local/share/layak-demo'
    if (default_dir / 'kokoro-v1.0.onnx').exists():
        return default_dir
    return default_dir


HERE = _resolve_kokoro_home()
VOICE = os.environ.get('DEMO_VOICE', 'jf_nezumi')
SPEED = float(os.environ.get('DEMO_SPEED', '1.0'))

# Chatterbox cloned voice configuration
CB_HOME = Path(os.environ.get('CHATTERBOX_HOME', Path.home() / '.local/share/layak-demo/chatterbox'))
CB_REF = Path(os.environ.get('CHATTERBOX_REF', CB_HOME / 'reference.wav'))

# Kokoro is the practical default if its local runtime/models are available;
# otherwise Chatterbox is retained with a documented fallback strategy.
_kokoro_ready = (HERE / 'kokoro-v1.0.onnx').exists() and (HERE / 'voices-v1.0.bin').exists()
TTS = os.environ.get('DEMO_TTS', 'kokoro' if _kokoro_ready else 'chatterbox')


def speak_chatterbox(text, out):
    """Chatterbox TTS, MIT, CPU. Lives in its own venv because it needs torch and a
    Python that is not this one -- so re-exec there rather than making the Kokoro
    environment carry 3 GB of wheels it never uses.

    THE ATTENTION SETTING IS NOT OPTIONAL. On this hardware the fused attention
    kernel emits all-NaN audio -- 180,960 of 180,960 samples on the first run -- and
    the failure surfaces two layers away, as `Audio buffer is not finite everywhere`
    raised by librosa inside the Perth watermarker. It reads as a watermarker bug and
    is not one. The tell is `Could not initialize NNPACK! Reason: Unsupported
    hardware` in the startup log. Eager attention plus the MATH SDPA backend produces
    finite audio; drop either and the narration is silence with a confusing traceback.
    """
    import torch

    # BEFORE the chatterbox import: MKL-DNN is a second fused path, separate from
    # SDPA, and on this hardware it is the other half of the NaN. Disabling only one
    # of the two still yields silence.
    torch.backends.mkldnn.enabled = False

    import torchaudio
    from chatterbox.tts import ChatterboxTTS

    model = ChatterboxTTS.from_pretrained(device='cpu')
    model.t3.tfmr.config._attn_implementation = 'eager'
    for m in model.t3.tfmr.modules():
        if hasattr(m, 'config'):
            m.config._attn_implementation = 'eager'
    with torch.nn.attention.sdpa_kernel(torch.nn.attention.SDPBackend.MATH):
        wav = model.generate(text, audio_prompt_path=str(CB_REF))
    if not torch.isfinite(wav).all():
        print('chatterbox produced non-finite audio; refusing to write silence', file=sys.stderr)
        return 1
    # int16, matching what Kokoro writes. torchaudio defaults to float32, and the
    # rest of the pipeline reads wavs with Python's `wave` module, which raises
    # `unknown format: 3` on IEEE float and takes the whole narration run with it.
    torchaudio.save(out, wav, model.sr, encoding='PCM_S', bits_per_sample=16)
    return 0


def main():
    if len(sys.argv) < 2:
        print('usage: speak.py <out.wav>   (text on stdin)', file=sys.stderr)
        return 2
    text = sys.stdin.read().strip()
    if not text:
        print('no text on stdin', file=sys.stderr)
        return 2

    if TTS == 'chatterbox':
        cb_python = CB_HOME / '.venv/bin/python'
        if not cb_python.exists():
            print(f'missing {cb_python}. See scripts/demo/README.md for the install.', file=sys.stderr)
            return 1
        # Checked here rather than inside generate(): without it the failure surfaces
        # from deep inside the model as a file-open error, after a forty-second load.
        if not CB_REF.exists():
            print(f'missing reference clip {CB_REF}. Record 10-20s of clean speech, or set', file=sys.stderr)
            print('CHATTERBOX_REF, or use DEMO_TTS=kokoro. See scripts/demo/README.md.', file=sys.stderr)
            return 1
        # Re-exec under the venv that has torch, unless already there.
        if Path(sys.executable).resolve() != cb_python.resolve():
            import subprocess

            return subprocess.run([str(cb_python), __file__, sys.argv[1]], input=text, text=True).returncode
        return speak_chatterbox(text, sys.argv[1])

    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    model, voices = HERE / 'kokoro-v1.0.onnx', HERE / 'voices-v1.0.bin'
    for f in (model, voices):
        if not f.exists():
            print(f'missing {f}. See scripts/demo/README.md for the download.', file=sys.stderr)
            return 1
    audio, rate = Kokoro(str(model), str(voices)).create(text, voice=VOICE, speed=SPEED, lang='en-us')
    if not np.isfinite(audio).all():
        print('kokoro produced non-finite audio; refusing to write silence', file=sys.stderr)
        return 1
    # 16-bit PCM WAV (PCM_16) so python's wave module can parse it cleanly
    sf.write(sys.argv[1], audio, rate, subtype='PCM_16')
    return 0


if __name__ == '__main__':
    sys.exit(main())
