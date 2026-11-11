# DreamWorld — AI 3D Bedtime Storybook

**Build:** 0.1.6 (real Phonon working in GitHub-hosted Chromium, pending Chromebook approval) · **Date:** 2026-11-11  
**Primary artifact:** `index.html` — single-file app source; Phonon requires its co-hosted worker and WASM package, installed by the included GitHub Actions deployment build.  
**Target:** Google Chrome on an 8 GB Chromebook, deployed via HTTPS on GitHub Pages.

## v0.1.6 — November 11, 2026: real deployed speech synthesis verified

**Root cause of the reported `Missing vendor/phonon/index.js (HTTP 503)`:** GitHub ran both its legacy branch-based Pages publisher and the custom Actions publisher. Only the Actions artifact contained the Phonon worker/WASM runtime. Depending on the latest publisher, the site could lose the files.

**Fixes made in DreamWorld-Bedtime-Stories (and nowhere else):**

- Bundled the official `phonon-tts@0.7.0` JavaScript module, worker, four WASM binaries, and licenses directly under `vendor/phonon/` in the **DreamWorld repository**, so either Pages publisher includes them.
- The GitHub Actions build now mirrors that runtime and verifies HTTP access to its published JS, worker, WASM, and catalog.
- Removed the misleading HTTP `HEAD` preflight that reported 503 as proof a file was absent. Direct import now follows the working Phonon browser integration pattern.
- Added a local `voices.json` with 102 catalog voice records and official sample paths. Sample playback no longer requires listing the Hugging Face directory on every click.
- Fixed the selected narrator **Reuben** to use the actual bundled voice exposed by the model as **`default`**, rather than passing the unsupported literal `Reuben` voice ID to the synth engine.

**Real automated test results on deployed GitHub Pages:**

- Live GitHub Actions deployment fetched `vendor/phonon/index.js` (17,020 B), `worker.js` (17,980 B), `wasm/phonon_tts_bg.wasm` (3,978,747 B), and `voices.json` (32,347 B) successfully over HTTPS (HTTP 200).
- A separate **real Chromium browser** test retrieved the public 31M model, loaded the local 102-voice catalog, generated **82,560 actual PCM samples / 3.4 seconds** of Phonon speech, and started playback through Web Audio.
- The browser test also imported a short complete story, opened it in DreamWorld's reader, pressed **Play**, and successfully generated story narration using the bundled default/Reuben voice mapping.
- This is real on-device browser model inference, *not* mocked audio. It establishes functioning synthesis in GitHub's Chromium runner, **not yet performance or playback quality on your particular Chromebook**.

**Tracker:** DW-016, DW-019, DW-082 and DW-088 have been promoted only to **Tested — Awaiting User Approval**. No feature has been marked Approved. Other previously reported defects remain unapproved unless separately tested.

**Use the live site:** https://tbenitz.github.io/DreamWorld-Bedtime-Stories/ . Confirm **v0.1.6**, open Settings → Test narrator audio or a saved story and press Play. Opening a lone `file://` copy cannot provide the module worker runtime.

**History-of-War:** accessed read-only as a working API reference. No edits were made there.

---

## v0.1.4 — November 11, 2026: immersive reader and narration validation

**User-reported problems:** a very long `file://` compatibility warning was inserted into the public UI; Phonon still did not synthesize speech; 3D worlds appeared like thumbnails; reading layout was not screen-filling; the user wanted a separate way to fill the actual display and see the entire 3D world.

**Corrections made to the application:**

- **Removed the file-origin banner completely** from HTML. Any necessary technical explanation is logged under **Settings → Activity & diagnostics**; a narration failure appears only when someone attempts to load the real model or start playback.
- The reader is **fixed to the entire browser viewport** when a book opens. Header navigation is hidden until you press the discreet `← Library` button. Its Three.js canvas covers the entire stage; the current narration text sits directly over the 3D scene in ivory text with a readability gradient, not in its own colored card.
- **⛶ Fullscreen** uses the browser's actual Fullscreen API on the *entire* reader so Three.js, story text, and playback controls remain together. Clicking again exits; Escape also exits.
- **◈ World only** hides story text, playback controls, and the title so the whole scene can be viewed; **Show story** restores them. It can also be combined with actual fullscreen.
- Advanced actions (choose voices, regenerate page, save, export) are tucked under the `⋯` menu rather than covering the scene.
- Real Phonon remains the only speech backend. The default compute device is now **CPU** for a conservative Chromebook startup; WebGPU/Auto remain available in Settings. The default narrator is the model-bundled **Reuben** (when supported), reducing first-use dependence on the external voice catalog. Existing saved voice choices are preserved.
- Added a **▶ Test narrator audio** action in Settings. It loads the deployed official Phonon runtime, synthesizes actual PCM through `tts.synth()`, checks the buffer is nonempty, and schedules the samples for playback through Web Audio. A successful model load *alone* is not treated as an audio test.
- Added an explicit same-origin `workerUrl`; build checks that `index.js`, `worker.js`, and WASM files are copied together. Network and worker failures remain documented in Settings (not on the cinematic world).
- **History-of-War was inspected read-only. Absolutely no files, settings, branches, or workflows were changed in that repository.**

**Evidence and remaining blocker:** the JS passes `node --check`; a Playwright Chromium test at 1440×900 and 390×844 confirmed the full-viewport reader, real browser fullscreen API, world-only mode, hidden warning, transparent story text, back navigation, and advanced menu. A separate offline regression exercised fake DeepSeek and fake Phonon audio to validate the application wiring, **not actual Phonon synthesis**. This environment could not download `phonon-tts` from npm (DNS/network blocked). Therefore **the real worker and model on the Chromebook are NOT claimed working**. DW-016 and DW-082 remain Broken / Needs Repair until a real audible on-device synthesis test succeeds. All checkboxes remain unchecked until the user explicitly approves each feature.

**How to verify without the old banner:** deploy the entire ZIP content (not only the HTML) to the DreamWorld repository with GitHub Pages set to GitHub Actions. After the workflow succeeds, load the HTTPS site; open **Settings → Load real Phonon model** then **▶ Test narrator audio**. It will show either actual playback metrics or the real error in Settings. Opening the HTML alone from `file://` will not start Phonon's module worker, because its worker/WASM files cannot be sourced this way; that is a browser restriction, not something this app can truthfully bypass with a fake voice. The main reading layout still works without narrated audio.

**New tracker entries:**

| Approval | ID | Feature | Status | Acceptance test | Known issue |
|---|---|---|---|---|---|
| - [ ] | **DW-085** | Full-viewport book reader with no page header | Implemented — Awaiting Test | Open a story on Chromebook and confirm scene fills browser window | Offline UI test passed; true Three.js rendering still needs live verification |
| - [ ] | **DW-086** | Actual browser fullscreen on the complete 3D reader | Implemented — Awaiting Test | Enter/exit fullscreen and check canvas fills display | Playwright native fullscreen passed; Chromebook test outstanding |
| - [ ] | **DW-087** | World-only mode and return to story | Implemented — Awaiting Test | Hide/reveal all story text and controls without hiding scenery | Offline Chromium test passed |
| - [ ] | **DW-088** | Real Phonon waveform test with worker diagnostics | Implemented — Awaiting Test | Synth and listen to audible Phonon audio on deployed HTTPS site | **No live model test available**; does not mean Phonon itself is working |

---

## v0.1.3 — November 11, 2026: full-screen 3D and Phonon worker fix

**Reported:** Real Phonon fails with “worker failed: could not start”; world renders only in a postage-stamp corner and story text occupies a boxed panel beneath it.

**Root causes and repairs:**

- Three.js renderer initialized its canvas at 300×300 and used `setSize(w,h,false)` later. The drawing buffer resized, but the old inline CSS dimensions remained, so the actual display stayed square. The canvas is now explicitly 100% width/height, observed by ResizeObserver and resized on fullscreen.
- The reader now occupies the viewport, the rendered 3D fills the entire stage and the story text floats over it without a separate text panel. A gentle transparent gradient helps text remain readable. Header and playback controls float over the stage rather than underneath.
- The former `cdn.jsdelivr.net` + Blob worker loader is removed. The **official** `phonon-tts@0.7.0` JS worker and WASM files are installed and copied together into `vendor/phonon/` during the **DreamWorld-only** GitHub Actions deployment. This matches the design used in History-of-War, inspected **read-only**. No files or settings of History-of-War were changed.
- The HTML checks that both `vendor/phonon/index.js` and `vendor/phonon/worker.js` exist before attempting real model initialization. It reports an error on an attempted narration load when running from `file://` or without a completed deployment instead of producing opaque worker errors. No browser `speechSynthesis` fallback is used.
- **Verification so far:** JavaScript syntax check passed; a headless browser with mocked AI / mocked Phonon module validated a 1440×816 stage, full-size canvas display, unboxed text overlay, story creation and playback flow, with no page exceptions. Real Phonon inference remains **unverified** until running on HTTPS with weights and WASM downloaded.

**Required deployment:** Use the provided ZIP for DreamWorld, not a lone `.html` upload. In DreamWorld's repo, commit `index.html`, `package.json`, `build.mjs`, and `.github/workflows/pages.yml`; in **Settings → Pages**, choose **GitHub Actions**. The workflow installs Phonon and publishes the app plus same-origin JS/worker/WASM to GitHub Pages. No Node/Python is needed on the Chromebook. Wait for successful Actions deployment, then open the HTTPS Pages URL. The first TTS load downloads model weights separately.

**Feature status:** DW-016 stays **Broken / Needs Repair** pending a real audio test; DW-050 is **Broken / Needs Repair** as a literal one-file-only Phonon hosting promise; DW-081–DW-084 are implemented but awaiting user testing. Every approval checkbox remains unchecked.

## v0.1.2 — November 11, 2026: repeated null.onclick and file:// reports

**Observed in user logs:** `DreamWorld2.html` on removable SD card via `file:///media/removable/...` still reports `Cannot set properties of null (setting 'onclick')` during restore, create, page generation and playback. The file name differs from the previous downloadable fixed `DreamWorld.html`, so whether it contained the prior patch is unknown. The local-file security error is separate.

**New repairs:**

- Replaced all dynamic library-card `.onclick` assignments with one permanent, delegated library click handler. Rendering cards cannot fail because a child button selector is absent.
- Made `saveBook()` isolate library drawing from story persistence: a UI error can no longer throw through the page-generation and narration pipeline.
- Added a temporary in-memory IndexedDB fallback if opening/using storage is blocked. **This fallback is not persistent across reloads.**
- Protected retrieval of saved key from localStorage where Chrome denies access on opaque `file://` origins.
- Added contextual file-origin diagnostics and on-screen `v0.1.2` identifier; real API, model worker and caching features require normal HTTPS deployment to be supported reliably.
- Preserved every existing feature ID and its unchecked approval state; DW-001, DW-016, DW-036, DW-038 remain `Broken / Needs Repair` until user tests succeed.

**Supported way to test:** Use `DreamWorld_v0.1.2.html` on GitHub Pages. On a Chromebook, avoid opening the app from a removable card using `file://` for real model/audio features. An HTML file on a USB/SD card can display the UI, but is not equivalent to an HTTPS origin. Confirm the brand reads `v0.1.2`, test DeepSeek connection, then generate a 3-minute story and Play. Old files named `DreamWorld2.html` will not automatically update.

**Testing:** The new version is subject to JavaScript syntax validation, browser UI and mocked API/narration regression. Live DeepSeek and Phonon endpoints not verified with user's credentials; no approval is inferred.

## v0.1.1 bug-fix release — November 11, 2026

**Reported issue:** Story generation stops / example narration reports `Cannot set properties of null (setting 'onclick')`.

**Confirmed root cause:** `renderBooks()` assigned event handlers to `data-rename`, `data-dup`, and `data-fav` selectors, but the generated HTML card contained none of these buttons. Every nonempty story library caused a TypeError during `saveBook()`, interrupting `generatePage()` and `ensureAudio()` (including when playing a saved story).

**Repairs applied:**

- Added the three missing buttons to the story-card markup, with functioning rename, duplicate, favorite actions. Corrected display of favorite status.
- Switched the recommended DeepSeek model to the current official `deepseek-flash`, while retaining `deepseek-v4-pro`. Older saved model choices are mapped to `deepseek-flash`.
- Disabled DeepSeek thinking for JSON story creation so the output-token budget goes to the requested story JSON. Retry logic handles blank/truncated output and temporary HTTP errors, and now gives clearer API/network errors.
- Added persistent visible errors on Create instead of relying solely on an ephemeral toast, and logged uncaught errors/rejections in Activity & diagnostics.
- Added fallback to an actually bundled Phonon voice when Hugging Face catalog metadata cannot be loaded. No browser `speechSynthesis` substitution.
- Included narration *text* in the audio cache signature so rewritten pages cannot accidentally reuse audio belonging to older text.

**Automated test result:** PASS with mock API and simulated Phonon PCM in headless Chromium for settings test, story outline, page generation, local-save pipeline, favorite, duplicate, and narration initialization. No uncaught JavaScript errors were observed in that test. The test substitutes network responses and does not prove the real DeepSeek endpoint, model weights, GPU, actual voice quality, or end-to-end Chromebook performance. 3D network library was deliberately unavailable in this offline integration test. **Do not mark these features Approved without an actual user test.**

**User retest:** Replace the older HTML with this file, keep the same GitHub Pages origin to preserve IndexedDB and the saved key, then refresh the tab (a hard reload is helpful). In Settings select `deepseek-flash`, press **Test connection**, then create a short 3-minute story. Open My Library and click Read book; try Play. If anything fails, copy the exact red message on Create, or use Settings → Export diagnostics. Avoid opening via `file://` if module workers fail; GitHub Pages HTTPS is the intended deployment path.

**Tracking:** DW-001, DW-016, DW-036, and DW-038 remain unchecked with `Broken / Needs Repair` until the user verifies the repaired workflows. No prior user approvals have been granted or altered.

## Status — important

This is a substantial initial implementation, **not a fully verified finished product**. The revised source passes JavaScript syntax checks and a mocked Chrome browser regression test covering DeepSeek planning, page generation, story saving, library actions, and narration playback setup. Real DeepSeek and Phonon downloads still need live testing. Live DeepSeek generation, model downloads, Phonon inference, 102 sample playback, and precise word-boundary accuracy have **not** been end-to-end verified with an API key on the target Chromebook. No feature has user approval. The status “Implemented — Awaiting Test” means code was supplied, **not** that the workflow passed.

Critical known risks:

- **Direct DeepSeek browser calls:** depends on CORS allowance by the DeepSeek endpoint; a backend/proxy may be necessary in some deployments. If a cross-origin request is rejected, DreamWorld reports an error. The HTML does **not** impersonate an API success or embed the API key.
- **Phonon runtime assets:** the application requires the official JS module, worker, and WASM files co-located on the same HTTPS GitHub Pages origin at `vendor/phonon/`. The supplied GitHub Actions build installs and deploys them; direct HTML-only upload will report missing runtime. Real audio has not yet been tested on the user’s Chromebook.
- **Word timing:** the optional Whisper-based model derives timestamps from the synthesized audio, and the code checks transcript identity and monotonic timing. This is not guaranteed to meet ±150 ms boundary accuracy; boundary error has not been measured. If alignment is unavailable or mismatched, only sentence highlighting is available. No guessed per-word timings are displayed.
- **Default Phonon 31M checkpoint is English-only.** Catalog voices in other languages are browseable, but require compatible accessible checkpoints, which may be gated. The app blocks language mismatches.
- **Saving:** IndexedDB audio/text persists in a normal browser profile subject to quota or user deletion. JSON story export does not embed audio blobs.
- **Procedural 3D:** DeepSeek can only choose from a validated supported asset registry. Unrecognized objects fall back to rocks; the registry needs more detailed builders and continuity. The current renderer builds scene data independently and does not yet crossfade with a fully warmed double-buffered next scene.
- **Performance:** Phonon generation + Whisper alignment + Three.js rendering have not been measured together on an 8 GB Chromebook. Auto-alignment is off by default.

## Start — v0.1.3 (the current supported setup)

1. In a **DreamWorld** GitHub repo (not History-of-War), upload all files from `DreamWorld_v0.1.3_GitHub_Pages_Package.zip` **including the `.github/workflows/pages.yml` path**. Do not upload just the ZIP as a file in the repo.
2. Choose **Settings → Pages → Source: GitHub Actions**. Commit to `main`; the workflow uses Node 22 in GitHub to install official `phonon-tts@0.7.0` and copies its JS, worker and WASM assets to `vendor/phonon/` in the published site.
3. Once Pages deploys successfully, open the HTTPS site. Confirm the create view header displays **v0.1.4**. The story view now fills the browser viewport; fullscreen icon enters actual browser fullscreen.
4. In Settings, enter the DeepSeek API key, select a supported model and test connection. Create or open a story.
5. In Settings, press **Load Phonon model**. Wait for the public English model weights to download. Select an English voice and press Play. If a worker or model download fails, the Diagnostics panel shows the error. This is real on-device Phonon; there is no simulated TTS fallback.
6. Stories/audio are saved locally in IndexedDB (subject to browser storage limits). Word-accurate audio alignment is still a separate model and not guaranteed.

**Do not open from `file:///media/removable/SD Card/...` to test actual Phonon.** Chrome's `file://` security context is not a supported origin for the relative module worker/WASM setup. The standalone HTML is supplied for inspection and editing but cannot by itself include these binary runtime assets.

## Architecture

- **DeepSeek:** `/chat/completions` with JSON mode, model selector, API key supplied at runtime, retry/error reporting, and actual usage tokens.
- **Story pipeline:** outline and persistent character IDs, then per-page JSON + scene and sentence/voice segments, then a sequential background queue. Failed pages can be rebuilt independently.
- **3D:** Three.js procedural environments from a validated object type registry. Procedural characters include dragons, foxes, owls, rabbits, bears, deer, robots, aliens, humans and others, with simple movement triggered by narration segment offsets.
- **Speech:** `phonon-tts` on-device CPU/WebGPU, `synth` returning Float32 PCM, selected catalog embeddings loaded using `addVoice`, custom compatible `.safetensors` blob imports, and per-page WAV caching in IndexedDB.
- **Synchronization:** the Web Audio `AudioContext.currentTime` drives playback, page changes, sentence highlighting and scene events. An optional audio-derived Whisper ASR output can supply word time boundaries after strict transcript validation. No words-per-minute or evenly divided per-word timing hack is used.
- **Reader:** responsive dark UI, volume, speed, seek, page controls, fullscreen, reduced motion, font size, night brightness, text-only mode, sleep timer and a simple original generated ambient soundscape.
- **Persistence:** story JSON, narrated WAV blobs, custom and catalog voice embeddings, preferences, reading position, and usage totals use IndexedDB. DeepSeek API key is intentionally separate and not stored unless the user opts in.

## Master feature tracker

Every stable feature starts **unchecked**. Even if implemented and tested by a developer, the box remains unchecked until you explicitly approve that exact feature ID. Status changes must preserve feature IDs. A broken/reported-regressed feature must be marked **Broken / Needs Repair**, remain unchecked, and have a recorded issue until you re-approve it.

Valid statuses: **Planned**, **In Development**, **Implemented — Awaiting Test**, **Tested — Awaiting User Approval**, **Approved**, **Broken / Needs Repair**.

| ID | Feature / scope | Status | Dependencies / acceptance test | Known issue or limitation |
|---|---|---|---|---|
| - [ ] **DW-001** | Original story generation via official DeepSeek API | Broken / Needs Repair | DeepSeek API account and CORS: Live JSON test + coherent page generation | Original v0.1.0 crashed when saving (missing library buttons); repaired in v0.1.1; DeepSeek live API/CORS still unverified |
| - [ ] **DW-002** | Story options: age, length, genre, mood, language | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-003** | Character names, counts, theme | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-004** | Surprise Me story prompts | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-005** | Persistent story plan and cast IDs | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-006** | One-page-first generation | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-007** | Progressive next-page DeepSeek queue | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-008** | Request errors and targeted page retry | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-009** | Validated JSON scene specifications | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-010** | Procedural Three.js environments | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-011** | Procedural characters with species-specific shapes | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-012** | Persistent character appearance | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-013** | Animated event triggers by sentence/audio segment | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-014** | Persistent world-state object graph across pages | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-015** | Double-buffered GPU scene swaps and crossfades | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-016** | Real Phonon 31M browser runtime | Broken / Needs Repair | Phonon 31M WASM model: Synthesize an audible WAV on ChromeOS | v0.1.0 narration was interrupted by saved-library DOM crash; repaired in v0.1.1; real vendor worker still not verified |
| - [ ] **DW-017** | CPU / WebGPU auto device selection | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-018** | Phonon weight caching / progress | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-019** | Fetch all 102 catalog entries live | Implemented — Awaiting Test | Hugging Face catalog JSONL: Retrieve and display 102 catalog voices | No live CORS test |
| - [ ] **DW-020** | Voice search, locale and preview samples | Implemented — Awaiting Test | Published Gradium sample Ogg: Playback test for every voice and locale | 102 samples not independently tried |
| - [ ] **DW-021** | Download and cache single voice embedding | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-022** | Custom .safetensors speaker embeddings | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-023** | Custom recorded-audio voice cloning | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-024** | Single narrator | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-025** | Distinct character voice assignments | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-026** | Automatic re-generation of changed-voice audio | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-027** | Accurate word boundaries from actual audio | In Development | Real audio + alignment benchmark: Measure boundary error against reference timings | No ±150 ms accuracy evidence |
| - [ ] **DW-028** | Whisper audio-derived transcript/timestamp validation | Implemented — Awaiting Test | Optional Transformers.js Whisper model: Compare real synthesized audio to expected words | Audio-derived ASR timestamps, not forced alignment |
| - [ ] **DW-029** | Display no fake word timing on alignment failure | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-030** | Sentence-level timed highlighting | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-031** | Web Audio clock play, pause, seek and speed | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-032** | Clickable sentence/word seeking | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-033** | Page transition at audio ending | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-034** | Cached WAV audio per page in IndexedDB | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-035** | Full-book MP3/WAV audio export | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-036** | Save, resume, browse and delete books | Broken / Needs Repair | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-037** | JSON export/import | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-038** | Rename, duplicate and favorite books | Broken / Needs Repair | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-039** | Rebuild one page without resetting book | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-040** | Dim bedtime UI, brightness, text size | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-041** | Dyslexia font, text panel height | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-042** | Ambient sounds, separate audio mixers, sleep fade | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-043** | Fullscreen, text-only, reduce-motion, sleep timer | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-044** | Chromebook adaptive graphics options | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-045** | Advanced FPS, memory, WebGPU diagnostics | In Development | Device performance APIs: Measure FPS/memory/queue under load | Memory instrumentation incomplete |
| - [ ] **DW-046** | Validated end-to-end browser test suite | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-047** | Full voice catalogue compatibility test | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-048** | User approvals with stable feature IDs | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-049** | International model setup and language compatibility | In Development | Multilingual checkpoint: Synthesize non-English segments correctly | Default 31M English only |
| - [ ] **DW-050** | Literal single-HTML-only GitHub Pages hosting without vendor assets | Broken / Needs Repair | Check module worker and WASM availability | Official Phonon requires binary worker/WASM sidecars; the provided GitHub Actions build requires no local build |
| - [ ] **DW-051** | Full scene continuity of returned locations and props | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-052** | Multiple animated weather and environmental transitions | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-053** | Advanced humanoid skeletal walk cycles and expressions | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-054** | More procedural animals buildings vehicles furniture and terrain | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-055** | Story covers that match actual generated scenes | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-056** | Library search sort filters and favorites UI | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-057** | Local EPUB or illustrated PDF export | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-058** | Story audio export as one combined listening book | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-059** | Separate custom voice sample recording and voice synthesis | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-060** | Custom voice consent prompts and safe persistence | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-061** | Official Reuben bundled voice detection | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-062** | Voice favorites and usage cache indicator per catalog entry | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-063** | Full voice model language switching without reload failures | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-064** | Word-alignment per-word confidence and quality diagnostics | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-065** | Precise alignment benchmark against ground truth boundaries | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-066** | Clickable single-word seek when timestamp available | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-067** | Sentence replay button and per-speaker audio replay | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-068** | Highlighting punctuation and split contractions reliably | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-069** | Smooth GPU scene crossfade when page ready | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-070** | Background scheduler keeps two ready pages ahead | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-071** | Background GPU preparation budget and resource cleanup | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-072** | World object changes without complete rebuild | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-073** | Adaptive particle counts and instanced geometry | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-074** | Scene-specific ambience sound library | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-075** | Independent narration ambience music and effect mixers | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-076** | Sleep timer fades background and screen brightness | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-077** | Story completion and exact playback resume position | Implemented — Awaiting Test | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Pending real-device verification |
| - [ ] **DW-078** | Cross-session incomplete story generation resume | In Development | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-079** | Full performance metrics and resource stress testing | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |
| - [ ] **DW-080** | All required user tests A to J signed off | Planned | Referenced browser/model APIs: Execute this feature on Chromebook and verify expected output | Not yet complete |

| - [ ] **DW-081** | Immersive viewport-wide 3D reader with transparent text overlay | Implemented — Awaiting Test | Chromebook open book on desktop/mobile and verify no boxed reading panel | Tested CSS dimensions in mocked browser; actual 3D still needs test |
| - [ ] **DW-082** | Official same-origin Phonon worker/WASM installed in Pages build | Broken / Needs Repair | Deploy DreamWorld action; verify worker and audio synth on ChromeOS | User reported Phonon still fails; needs actual audio test on deployed HTTPS site with worker/WASM present |
| - [ ] **DW-083** | Canvas resize on reader load, window size, fullscreen | Implemented — Awaiting Test | Verify no 300×300 thumbnail at any size | Layout test passed with mock canvas |
| - [ ] **DW-084** | Only show file-origin / Phonon deployment errors in diagnostics when narrated audio is requested | Implemented — Awaiting Test | Open from SD card and missing vendor; inspect error | No fake fallback |

## Detailed acceptance tests (required before any user approval)

- **A. Create story:** Use a real DeepSeek account, verify structured outline, coherent plot and original first page; reload a partially generated book and ensure previously generated pages do not repeat.
- **B. Render 3D:** Verify actual Three.js WebGL rendering (not a static image), species and clothing consistency, scene objects, camera, lighting, and trigger movements.
- **C. Narration:** Start public Phonon 31M, synthesize and listen to real audible WAV; verify speed/pause/seek/volume and no `speechSynthesis` fallback.
- **D. Voice catalog:** Load all 102 catalog records; verify each locale count and official sample links. Test several actual embeddings including an English character voice. Count Reuben only if it truly appears and works.
- **E. Alignment:** Use actual generated audio and compare words with listening/reference boundaries. Include repeated words, contractions, punctuation, long and short pauses, and long paragraphs. Measure boundary errors and withhold word highlighting on failures.
- **F. Multi-voice:** Generate a narrator and two speaking characters; confirm audio changes to the selected real voices and that changing one voice invalidates affected audio only.
- **G. Background generation:** While narration plays, request page 2 and prepare its scene/audio; verify no abrupt word cutoff and no unrelated world displayed during a failure.
- **H. Saved stories:** Refresh Chrome and reopen complete and partial stories with full text, 3D metadata, cached narration, progress and selected voices intact.
- **I. Custom voice:** Import a legitimate consenting speaker's compatible `.safetensors` embedding, use it for a narration segment, refresh the browser and replay the same voice. Reject audio uploads masquerading as voice models.
- **J. Chromebook:** Measure sustained fps, first generation time, 31M model download, 8 GB RAM usage, WASM CPU and WebGPU reliability, and Whisper alignment overhead on ChromeOS.

## Feature-status rules across revisions

1. Keep feature IDs immutable and keep new requirements in the tracker (next `DW-051`).
2. Mark *Implemented — Awaiting Test* only when the application contains its relevant code; it is not an end-to-end pass.
3. Mark *Tested — Awaiting User Approval* only after an actual repeatable test with evidence, including the browser/device used and any limitations.
4. Mark *Approved* and check a box **only** when the user explicitly approves the particular ID. Never infer approval from a passing test.
5. If the user reports a regression, change to *Broken / Needs Repair*, uncheck it, add the exact failure report, and preserve past ID and history.
6. Require any new optional dependency to be documented honestly and avoid pretending that all weights/worker binaries are embedded in a single HTML file.

## Sources used for implementation

- Official Phonon browser API: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md
- Gradium public voice catalog: https://huggingface.co/gradium/phonon-voices and `voices.jsonl`
- Phonon browser npm release: https://www.npmjs.com/package/phonon-tts
- DeepSeek JSON mode: https://api-docs.deepseek.com/guides/json_mode/
- Three.js: https://threejs.org/
- Transformers.js: https://huggingface.co/docs/transformers.js/

## Security / privacy

All narration is designed to run locally after model downloads. DeepSeek requests transmit the story prompt and current story context to DeepSeek with the API key supplied by the user. Voice embeddings remain local unless the user chooses a remote catalog voice (downloaded from Hugging Face). The application contains no analytics or telemetry. For a production multi-user site, prefer an authenticated server-side DeepSeek proxy over exposing a personal API key in frontend storage.