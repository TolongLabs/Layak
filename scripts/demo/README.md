# Layak Demo Recorder

Automates recording the deployed Layak site (`https://layak.vercel.app`), dubs the walkthrough with cloned or synthetic narration, burns in synchronized subtitles, and muxes everything into a 1920x1080 H.264/AAC MP4 deliverable. Free, local, no third-party API keys or paid accounts.

```
narration.txt ──► speak.py ──► seg/*.wav ──► schedule.py ──┐
                                        └──► subtitles.py ─┤
                                                           ├──► ffmpeg ──► demo.mp4
walk.mjs ──► record.mjs ──► capture.webm ──► assemble.sh ──┘
                         └► beats.json ────────┘
```

- **Single source of truth**: Narration audio and subtitle generation both read `lines.json`. What is spoken and what is displayed cannot diverge.
- **Beat-keyed timing**: Narration is anchored to UI beats measured during browser recording, not arbitrary static timestamps. If a network call slows down, narration follows the picture rather than drifting.
- **Pitch slides are optional**: The normal path captures the live application directly without slides. Slide rendering and assembly remain available when needed.
- **Target runtime**: Designed strictly for a 60–75 second investor/VC walkthrough.

---

## Provenance

This demo recording harness was adapted from `TolongLabs/codenection-dev/scripts/demo`. That repository declared its earlier origin from `TolongLabs/MakanLah` (where initial harness components `record.mjs` and `narrate.sh` were committed 28–30 August 2026).

The harness was not originally authored in Layak; it is carried across as shared team tooling.

| Dimension            | Role                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **What it is**       | Build & recording automation harness — a camera and dubber, not an application feature                |
| **Where it runs**    | Standalone in `scripts/demo/`, never imported into `frontend/` or `backend/`                          |
| **Whose it is**      | Carried over from team tooling in `TolongLabs/codenection-dev` (originating in `TolongLabs/MakanLah`) |
| **What it produces** | `demo.mp4` video deliverable. Zero lines from `scripts/demo/` enter production builds                 |

---

## Harness Structure

Two files contain product-specific definitions; the remainder are generic harness utilities.

| File                | Role                                                              | Changes When                     |
| ------------------- | ----------------------------------------------------------------- | -------------------------------- |
| **`walk.mjs`**      | Camera choreography: page interactions and `mark()` beats         | App UI, routing, or flows change |
| **`narration.txt`** | Script lines keyed to beat names: `beat \| offset_ms \| text`     | Walkthrough script changes       |
| `record.mjs`        | Headless browser runner; records `capture.webm` and `beats.json`  | Rarely (browser launch knobs)    |
| `speak.py`          | Audio synthesis per line (Kokoro default, Chatterbox option)      | Rarely (TTS settings)            |
| `schedule.py`       | Resolves overlapping speech; enforces spacing between lines       | Never (scheduling math)          |
| `subtitles.py`      | Generates line-wrapped SRT subtitle cards from `lines.json`       | Never (subtitle layout rules)    |
| `narrate.sh`        | Orchestrates synthesis, deconfliction, subtitle burn, and MP4 mux | Rarely                           |
| `assemble.sh`       | Normalizes capture; optionally stitches slide stills to timeline  | When slide deck changes          |
| `slides/render.mjs` | Renders HTML slides to PNG with subtitle collision verification   | Rarely                           |

---

## Install

All browser and audio stack dependencies stay isolated in scratch directories and virtual environments. **Do not add them to `package.json` or `backend/`.**

### 1. Playwright (Scratch Directory)

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/layak-demo"
mkdir -p "$DEMO_DIR" && cd "$DEMO_DIR"
bun add -d playwright
bunx playwright install chromium   # or use system Chrome via DEMO_CHANNEL=chrome
```

### 2. Chatterbox TTS (Optional, Cloned Voice)

Chatterbox runs in a dedicated Python 3.11 virtualenv with PyTorch:

```bash
export CHATTERBOX_HOME="$HOME/.local/share/layak-demo/chatterbox"
mkdir -p "$CHATTERBOX_HOME" && cd "$CHATTERBOX_HOME"
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python chatterbox-tts torchaudio

# Reference clip: 10-20 seconds of clean speech, single speaker, no background music/noise
cp /path/to/reference_sample.wav "$CHATTERBOX_HOME/reference.wav"
```

### 3. Kokoro TTS (Default Synthetic Voice)

Fast local ONNX synthesis that requires no reference clip:

```bash
export KOKORO_HOME="$HOME/.local/share/layak-demo"
mkdir -p "$KOKORO_HOME" && cd "$KOKORO_HOME"
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python kokoro-onnx soundfile
curl -sLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

### System Tools

Ensure `ffmpeg` and `ffprobe` are present on system `PATH`:

```bash
command -v ffmpeg && command -v ffprobe
```

---

## Execution Commands

### 1. Capture

Records live UI interactions from the deployed site:

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/layak-demo"
export DEMO_WEB="https://layak.vercel.app"

node scripts/demo/record.mjs
```

Outputs `$DEMO_DIR/capture.webm` and `$DEMO_DIR/beats.json`. Review stdout to confirm every target beat was marked.
The scripted investor path preloads Aisyah's bundled synthetic intake, then opens a persisted completed guest
evaluation. This keeps the recording deterministic and below 75 seconds without pretending the four-minute live
evaluation finished during an edited cut.

### 2. Slide Assembly (Optional)

The normal path records the live application directly without pitch slides. If pitch slides are needed:

```bash
# Render HTML slides in scripts/demo/slides/ to PNGs and check subtitle collision
export DEMO_SLIDES="arch:12 close:15"
node scripts/demo/slides/render.mjs

# Stitch slides onto the end of capture.webm and extend beats.json
bash scripts/demo/assemble.sh
```

If `DEMO_SLIDES` is empty or unset, `assemble.sh` normalizes `capture.webm` into 1080p canvas `$DEMO_DIR/capture-joined.mp4` without requiring slides. If skipped entirely, `narrate.sh` will process `capture.webm` directly.

### 3. Dub and Mux

Synthesizes audio, runs line deconfliction, generates subtitles, and muxes the deliverable:

```bash
# Using the default Kokoro synthetic voice:
bash scripts/demo/narrate.sh

# Or using Chatterbox voice cloning after its setup step:
DEMO_TTS=chatterbox bash scripts/demo/narrate.sh
```

Outputs `$DEMO_DIR/demo.mp4`.

### 4. Verify Deliverable

Verify all deliverable invariants before release:

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/layak-demo"
DELIVERABLE="$DEMO_DIR/demo.mp4"

# 1. Total runtime must be between 60 and 75 seconds:
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DELIVERABLE")
echo "Measured duration: ${DURATION}s"
python3 -c "import sys; d=float(sys.argv[1]); assert 60.0 <= d <= 75.0, f'Runtime {d}s outside 60-75s window'" "$DURATION"

# 2. Dimensions (1920x1080) and video codec (H.264):
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of csv=p=0 "$DELIVERABLE"

# 3. Audio stream present and encoded as AAC:
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate -of csv=p=0 "$DELIVERABLE"

# 4. Audio signal integrity (audible speech, non-silent):
ffmpeg -i "$DELIVERABLE" -af "volumedetect" -vn -sn -dn -f null /dev/null 2>&1 | grep -E "max_volume|mean_volume"

# 5. Burned subtitles track:
head -n 20 "$DEMO_DIR/narration.srt"
```

### 5. Export

Copy the verified deliverable to the designated walkthrough path:

```bash
mkdir -p ~/Downloads
cp "$DEMO_DIR/demo.mp4" ~/Downloads/Layak-VC-Walkthrough.mp4
ls -lh ~/Downloads/Layak-VC-Walkthrough.mp4
```

---

## Environment Configuration

| Variable          | Default                                | Description                                                     |
| ----------------- | -------------------------------------- | --------------------------------------------------------------- |
| `DEMO_DIR`        | `$TMPDIR/layak-demo`                   | Scratch directory for captures, audio segments, and final MP4   |
| `DEMO_WEB`        | `https://layak.vercel.app`             | Target deployment URL to film                                   |
| `DEMO_TTS`        | `kokoro` when installed                | TTS engine (`kokoro` or `chatterbox`)                           |
| `CHATTERBOX_HOME` | `~/.local/share/layak-demo/chatterbox` | Chatterbox virtual environment and model cache                  |
| `CHATTERBOX_REF`  | `$CHATTERBOX_HOME/reference.wav`       | Reference audio sample for voice cloning                        |
| `KOKORO_HOME`     | `~/.local/share/layak-demo`            | Kokoro model and voices directory                               |
| `DEMO_VOICE`      | `jf_nezumi`                            | Kokoro voice ID                                                 |
| `DEMO_SPEED`      | `1.0`                                  | Narration playback speed factor                                 |
| `DEMO_PAD`        | `#F4F7F4`                              | Pillarbox pad color matching Layak UI background                |
| `DEMO_SLIDES`     | `""`                                   | Optional `name:seconds` pairs for trailing slide stills         |
| `DEMO_OUT`        | `$DEMO_DIR/demo.mp4`                   | Target path of muxed deliverable                                |
| `DEMO_CHANNEL`    | `chrome`                               | Browser channel for Playwright (`chrome` or unset for Chromium) |

---

## Preserved Technical Cautions

- **Chatterbox Attention Trap**: On certain CPU architectures, PyTorch fused attention kernels emit silent all-NaN audio buffers, eventually failing downstream with `Audio buffer is not finite everywhere` inside the Perth watermarker. To prevent this, `speak.py` sets `torch.backends.mkldnn.enabled = False` before importing Chatterbox, and forces eager attention with `SDPBackend.MATH`. Both settings must remain intact.
- **16-bit PCM Audio Format**: All speech segments are written as 16-bit signed PCM WAVs. Python's standard `wave` module does not support 32-bit float audio and raises `unknown format: 3` if float formats are written.
- **Beat Deconfliction**: A visual beat marks when a feature appears, not how long the narration line takes to speak. `schedule.py` pushes start times later whenever a line would overrun the next beat, preventing overlapping voices while preserving visual synchronization.
- **Pacing**: Automated clicks and typing must hold on readable text cards for 2–3 seconds. Instant transitions feel artificial on camera and prevent viewers from absorbing content.
- **16:10 to 16:9 Letterboxing**: The browser capture viewport is 1440x900 (16:10). Rather than cropping content to 16:9, it is scaled to 1728x1080 and padded horizontally to 1920x1080 using `DEMO_PAD` (`#F4F7F4`), making pillarbox bars blend seamlessly into the Layak page background.
- **Subtitle Layout Rules**: Subtitles are burned at `FontSize=14` libass script units with `BorderStyle=3` and `MarginV=28`. Under `BorderStyle=3`, the bounding box scrim colour is driven by `OutlineColour`. Lines are wrapped at ~42 characters over at most 2 lines, minimising the longest line to avoid ragged edges and orphaned words.
- **Slide Subtitle Clearance**: When slides are rendered via `slides/render.mjs`, content must stay above `Y=852` px (`SUBTITLE_TOP`) to prevent collision with the bottom subtitle banner.
