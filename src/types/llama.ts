// LLM 관련 타입
export interface LlamaModelInfo {
  model_size: number;
  model_n_ctx: number;
  model_n_embd: number;
  model_n_head: number;
  model_n_layer: number;
  model_ftype: number;
  model_vocab_size: number;
}

export interface ModelSelectionResult {
  path: string;
  name: string;
  info: LlamaModelInfo;
}
