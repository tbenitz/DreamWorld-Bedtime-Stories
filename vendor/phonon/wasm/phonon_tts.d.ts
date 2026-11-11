/* tslint:disable */
/* eslint-disable */

/**
 * A loaded model, on the CPU.
 *
 * The state sits behind an `Rc<RefCell<Option<_>>>` because `generation_step` returns a
 * promise and a `RefCell` borrow may not be held across one: the step takes the state out for
 * its duration and puts it back after. A call that arrives meanwhile finds it missing and is
 * refused, so calls must not overlap; `phonon-tts`'s worker awaits each one. The exception
 * is `stop_generation`, which the step applies when it puts the state back.
 */
export class Model {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Registers a voice from a safetensors file and returns its index for
     * `start_generation`. Either a precomputed KV cache (`embeddings_v2/`) or a voice
     * embedding (`emb`, `audio_prompt` or `speaker_wavs`), told apart by tensor name.
     */
    add_voice(voice: Uint8Array): number;
    /**
     * `"cpu"`: where this model runs.
     */
    device(): string;
    /**
     * Kept for callers written when this module also ran on WebGPU, where a voice's prompt
     * was only recorded until flushed. The CPU has nothing queued: resolves at once.
     */
    flush(): Promise<any>;
    /**
     * Samples in one 80 ms frame: `generation_step` returns whole frames.
     */
    frame_size(): number;
    /**
     * Generates and decodes the next frame of the current chunk: a promise of mono PCM at
     * `sample_rate`, one `frame_size`-sample frame, or of `undefined` when the chunk is
     * finished.
     */
    generation_step(): Promise<any>;
    /**
     * The languages the model was trained for, as listed in its config.
     */
    languages(): string[];
    /**
     * Loads a model. `model_weights` is a safetensors or GGUF checkpoint, `tokenizer_json`
     * the contents of the `tokenizer.json` for its vocabulary, and `config_json` its
     * `config.json`. All three are required.
     *
     * One thing a config cannot ask this build for: classifier-free guidance. Guidance is a
     * caller's option in `ptts::synth` (`SpeechOptions::cfg_coef`), not a field of the
     * config, and the browser build never turns it on, so `cfg_null_audio_empty` is inert.
     * A config with baked-in `voices` is refused: voices here come from files. Everything
     * else -- the flow LM and Mimi shapes, `lsd_decode_steps`, `eos_threshold`, `model_id`,
     * `speaker_mimi`, `conditioners` -- is honored.
     *
     * `quant` is `"f32"` or `"q8"`.
     *
     * `lang` is required: the language text is normalized as before it is
     * tokenized, one of `"en"`, `"fr"`, `"de"`, `"es"`, `"pt"`, `"ar"`, `"hi"`,
     * `"ko"`, `"pl"`, `"sv"`, `"fi"`, `"no"`, `"it"`, `"nl"`, `"ja"`, `"zh"`,
     * `"da"`, `"tr"`, or `"none"`
     * to hand text to the tokenizer as written. The spoken forms of `@`, `+`
     * and `=` differ per language, so there is nothing safe to default to.
     *
     * `rewrites` is optional and picks which word rewrites run on the
     * normalized text: `"default"` (numbers, currency, dashed-digits, emails,
     * urls, abbreviations, elongations), `"all"` (those and phones, times,
     * dates), `"none"`, or a comma-separated list of rule names. The rules
     * only read `"en"`, `"fr"`, `"de"`, `"es"` and `"pt"`.
     *
     * `conditions` is optional and sets the config's conditioners, each as `"NAME=VALUE"`,
     * e.g. `["duration_delta=0.5"]`. Those left out take their defaults.
     *
     * `device` must be `"cpu"`. WebGPU is not in this module: `phonon-tts` runs its own
     * engine for it, with a [`Preparer`] for the text and the voices.
     */
    static load(model_weights: Uint8Array, tokenizer_json: Uint8Array, config_json: Uint8Array, quant: string, lang: string, rewrites: string | null | undefined, conditions: string[] | null | undefined, device: string): Promise<Model>;
    /**
     * Prompts the model with the next chunk's text and returns its token count, or
     * `undefined` once every chunk has been generated.
     */
    next_chunk(): number | undefined;
    sample_rate(): number;
    /**
     * Normalizes `text`, splits it into sentence-aligned chunks and tokenizes them. Returns
     * the number of chunks. Runs no model: call `next_chunk` to start the first one.
     */
    start_generation(voice_index: number, text: string, temperature: number, seed: bigint): number;
    /**
     * Drops the generation in progress, if any. Called while a `generation_step` is pending,
     * it takes effect when that step returns: the step still delivers its frame, and the
     * next one reports the end.
     */
    stop_generation(): void;
}

/**
 * The parts of a checkpoint the WebGPU engine needs from Rust, without the model itself: the
 * tokenizer and the text normalization ([`plan::chunks`], as every other frontend splits
 * text), the voice files, and the sum of the config's conditioners.
 *
 * Its tensors are the few the conditioners and the speaker projection need, which the caller
 * takes out of the checkpoint (`flow_lm.condition_provider.conditioners.*` in the GGUF, under
 * their GGUF names, as a safetensors file). The transformer and Mimi weights never come here.
 */
export class Preparer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The vector every frame's input adds: the conditioners at their values, `d_model` long
     * (zeros for a checkpoint without conditioners).
     */
    conditions(): Float32Array;
    /**
     * Samples in one 80 ms frame.
     */
    frame_size(): number;
    /**
     * The languages the model was trained for, as listed in its config.
     */
    languages(): string[];
    /**
     * `tokenizer_json`, `config_json`, `lang`, `rewrites` and `conditions` as for
     * [`Model::load`]; `tensors` a safetensors file with the conditioner tensors.
     */
    constructor(tokenizer_json: Uint8Array, config_json: Uint8Array, tensors: Uint8Array, lang: string, rewrites?: string | null, conditions?: string[] | null);
    /**
     * `text` as the model is prompted with it: an array of chunks, each
     * `{ tokens: Uint32Array, framesAfterEos, frameBudget }`.
     */
    plan(text: string): Array<any>;
    sample_rate(): number;
    /**
     * A voice file's prompt: `{ kind: 'rows', frames, rows }`, the rows the flow LM is
     * prompted with (`[frames, d_model]`, for an `emb` voice or `speaker_wavs` latents through
     * the speaker projection), or `{ kind: 'kv', frames, k, v }` for a voice stored as the KV
     * cache (`embeddings_v2/`): one `[frames, heads * head_dim]` array per layer in `k` and `v`.
     */
    voice(bytes: Uint8Array): object;
}

/**
 * CPU SIMD features the wasm module was compiled with. The relevant one
 * for browser builds is `simd128`; `avx`/`neon`/`f16c` are reported for
 * completeness so it's clear which native-target builds enabled them.
 */
export function cpu_features(): object;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_model_free: (a: number, b: number) => void;
    readonly __wbg_preparer_free: (a: number, b: number) => void;
    readonly cpu_features: () => any;
    readonly model_add_voice: (a: number, b: number, c: number) => [number, number, number];
    readonly model_device: (a: number) => [number, number, number, number];
    readonly model_flush: (a: number) => any;
    readonly model_frame_size: (a: number) => [number, number, number];
    readonly model_generation_step: (a: number) => any;
    readonly model_languages: (a: number) => [number, number, number, number];
    readonly model_load: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => any;
    readonly model_next_chunk: (a: number) => [number, number, number];
    readonly model_sample_rate: (a: number) => [number, number, number];
    readonly model_start_generation: (a: number, b: number, c: number, d: number, e: number, f: bigint) => [number, number, number];
    readonly model_stop_generation: (a: number) => void;
    readonly preparer_conditions: (a: number) => [number, number];
    readonly preparer_frame_size: (a: number) => number;
    readonly preparer_languages: (a: number) => [number, number];
    readonly preparer_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly preparer_plan: (a: number, b: number, c: number) => [number, number, number];
    readonly preparer_sample_rate: (a: number) => number;
    readonly preparer_voice: (a: number, b: number, c: number) => [number, number, number];
    readonly wasm_bindgen_f59f3b34b769d362___convert__closures_____invoke___wasm_bindgen_f59f3b34b769d362___JsValue__core_37ee0ce0c4cd57d5___result__Result_____wasm_bindgen_f59f3b34b769d362___JsError___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_f59f3b34b769d362___convert__closures_____invoke___js_sys_ee9836ddb2bdf100___Function_fn_wasm_bindgen_f59f3b34b769d362___JsValue_____wasm_bindgen_f59f3b34b769d362___sys__Undefined___js_sys_ee9836ddb2bdf100___Function_fn_wasm_bindgen_f59f3b34b769d362___JsValue_____wasm_bindgen_f59f3b34b769d362___sys__Undefined_______true_: (a: number, b: number, c: any, d: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
