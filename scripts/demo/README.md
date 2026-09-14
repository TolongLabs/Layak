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
- **Target runtime**: Designed for a focused 60–120 second investor/VC walkthrough.

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
| `contract.mjs`      | Exact required beat sequence and capture-completeness audit       | When the walkthrough changes     |
| `warmup.mjs`        | Retries off-camera production warm-up before capture              | When cold-start surfaces change  |
| `proof.mjs`         | Verifies Aisyah's identity, result totals, and `.gov.my` evidence | When the saved proof changes     |
| `motion.mjs`        | Constant-rate camera scrolling with CSS easing suspended          | Rarely (motion tuning)           |
| `manifest.py`       | Resolves narrated beats and fails on missing visual moments       | Never (timing contract)          |
| `speak.py`          | Batch synthesis (Kokoro or reference-cloned Chatterbox)           | Rarely (TTS settings)            |
| `schedule.py`       | Clears speech collisions; rejects lines crossing visual beats     | Never (scheduling math)          |
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

Chatterbox runs in a dedicated Python 3.11 virtualenv with PyTorch. The pinned
requirements use Chatterbox Nano by default: it is the official CPU-oriented
variant and still supports zero-shot reference-voice cloning.

```bash
export CHATTERBOX_HOME="$HOME/.local/share/layak-demo/chatterbox"
mkdir -p "$CHATTERBOX_HOME" && cd "$CHATTERBOX_HOME"
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python \
  -r /path/to/Layak/scripts/demo/chatterbox-requirements.txt

# Reference clip: 10-20 seconds of clean speech from one speaker.
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
Before recording starts, the runner warms the guest dashboard, saved result, Cik Lay response, and first packet preview
so Render free-tier startup stays off-camera. The scripted path then preloads Aisyah's bundled synthetic intake and
shows the pipeline beginning. A labeled "About one minute later" card makes the jump to a persisted completed evaluation
explicit; the capture never pretends that the full evaluation completed instantly. The runner retries one transient
warm-up failure and refuses to record if the second attempt fails. It also verifies Aisyah's identity, `13,808` RM,
12 matched schemes, an official Malaysian `.gov.my` source, and a completed Cik Lay answer before accepting the run.

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

# Or using Chatterbox voice cloning and the optional ducked music bed:
DEMO_TTS=chatterbox \
CHATTERBOX_REF=/path/to/reference.wav \
DEMO_BGM=/path/to/background-music.mp3 \
bash scripts/demo/narrate.sh
```

Outputs `$DEMO_DIR/demo.mp4`.

### 4. Verify Deliverable

Verify all deliverable invariants before release:

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/layak-demo"
DELIVERABLE="$DEMO_DIR/demo.mp4"

# 1. Total runtime must be between 60 and 120 seconds:
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DELIVERABLE")
echo "Measured duration: ${DURATION}s"
python3 -c "import sys; d=float(sys.argv[1]); assert 60.0 <= d <= 120.0, f'Runtime {d}s outside 60-120s window'" "$DURATION"

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

| Variable             | Default                                | Description                                                     |
| -------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `DEMO_DIR`           | `$TMPDIR/layak-demo`                   | Scratch directory for captures, audio segments, and final MP4   |
| `DEMO_WEB`           | `https://layak.vercel.app`             | Target deployment URL to film                                   |
| `DEMO_TTS`           | `kokoro` when installed                | TTS engine (`kokoro` or `chatterbox`)                           |
| `CHATTERBOX_VARIANT` | `nano`                                 | Chatterbox model (`nano`, `turbo`, or `base`)                   |
| `CHATTERBOX_HOME`    | `~/.local/share/layak-demo/chatterbox` | Chatterbox virtual environment and model cache                  |
| `CHATTERBOX_REF`     | `$CHATTERBOX_HOME/reference.wav`       | Reference audio sample for voice cloning                        |
| `KOKORO_HOME`        | `~/.local/share/layak-demo`            | Kokoro model and voices directory                               |
| `DEMO_VOICE`         | `jf_nezumi`                            | Kokoro voice ID                                                 |
| `DEMO_SPEED`         | `1.15` Kokoro / `1.0` Chatterbox       | Narration playback speed factor                                 |
| `DEMO_PAD`           | `#F4F7F4`                              | Pillarbox pad color matching Layak UI background                |
| `DEMO_SLIDES`        | `""`                                   | Optional `name:seconds` pairs for trailing slide stills         |
| `DEMO_OUT`           | `$DEMO_DIR/demo.mp4`                   | Target path of muxed deliverable                                |
| `DEMO_CHANNEL`       | `chrome`                               | Browser channel for Playwright (`chrome` or unset for Chromium) |
| `DEMO_WARMUP`        | `1`                                    | Set `0` to skip the off-camera production warm-up               |
| `DEMO_RESULT_URL`    | Verified Aisyah result                 | Persisted result used after the disclosed processing time jump  |
| `DEMO_LIVE_PIPELINE` | `0`                                    | Set `1` only when intentionally filming the full live run       |
| `DEMO_BGM`           | `""`                                   | Optional background-music file, looped and ducked under speech  |
| `DEMO_BGM_GAIN_DB`   | `-17`                                  | Music gain before speech-triggered ducking                      |
| `DEMO_MIN_DURATION`  | `60`                                   | Reject a deliverable shorter than this many seconds             |
| `DEMO_MAX_DURATION`  | `120`                                  | Reject a deliverable longer than this many seconds              |

---

## Preserved Technical Cautions

- **Chatterbox variants**: Nano is the CPU default. `turbo` offers a larger model; `base` is retained for compatibility but is impractically slow without a GPU on this host. The reference embedding and model are each loaded once per script, and content-addressed audio is cached outside the repository.
- **CPU attention trap**: On this host, fused paths in both Nano and the base model emit silent all-NaN audio. `speak.py` disables MKL-DNN before every Chatterbox import and forces `SDPBackend.MATH`; the base model additionally forces eager transformer attention. These settings must remain intact.
- **Perth/setuptools compatibility**: Older Perth builds import `pkg_resources`, which setuptools removed. `chatterbox-requirements.txt` pins `setuptools<81`; do not loosen that bound without rebuilding and smoke-testing the voice path.
- **16-bit PCM Audio Format**: All speech segments are written as 16-bit signed PCM WAVs. Python's standard `wave` module does not support 32-bit float audio and raises `unknown format: 3` if float formats are written.
- **Beat Deconfliction**: A visual beat marks when a feature appears, not how long the narration line takes to speak. `schedule.py` may move a line only to clear prior speech, then fails the render if any line crosses into the next visual beat. Retiming the capture is required instead of narrating the wrong screen.
- **Pacing and scrolling**: Camera moves use a constant-speed `requestAnimationFrame` interpolation from `motion.mjs`; do not restore Playwright's snapping `scrollIntoViewIfNeeded`. Beat intervals are floored against the measured Chatterbox and default Kokoro lines, while slow page work naturally counts toward the interval.
- **16:10 to 16:9 Letterboxing**: The browser capture viewport is 1440x900 (16:10). Rather than cropping content to 16:9, it is scaled to 1728x1080 and padded horizontally to 1920x1080 using `DEMO_PAD` (`#F4F7F4`), making pillarbox bars blend seamlessly into the Layak page background.
- **Subtitle layout rules**: Subtitles use Quicksand at `FontSize=10.5`, `MarginV=10`, and a compact translucent `BorderStyle=3` scrim with `Outline=0.75` padding so adjacent backing rows remain separate. Cards wrap at 36 characters over at most two rows, and the schedule forbids cue overlap.
- **Slide Subtitle Clearance**: When slides are rendered via `slides/render.mjs`, content must stay above `Y=852` px (`SUBTITLE_TOP`) to prevent collision with the bottom subtitle banner.
