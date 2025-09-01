// Wllama 설정 - WASM 파일 경로
export const WLLAMA_CONFIG = {
  'single-thread/wllama.wasm': '/node_modules/@wllama/wllama/esm/single-thread/wllama.wasm',
  'multi-thread/wllama.wasm': '/node_modules/@wllama/wllama/esm/multi-thread/wllama.wasm',
};
// 또는 CDN 사용 (권장)
export const WLLAMA_CONFIG_CDN = {
  'single-thread/wllama.wasm': 'https://unpkg.com/@wllama/wllama@latest/esm/single-thread/wllama.wasm',
  'multi-thread/wllama.wasm': 'https://unpkg.com/@wllama/wllama@latest/esm/multi-thread/wllama.wasm',
  // 방법 1: nginx 서버에서 제공하는 모델
  model: 'https://www.dwon.store/models/euro_gguf.gguf',
  // 방법 2: 대안 URL들
  // model: 'https://huggingface.co/TheBloke/Phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf',
  // model: 'https://huggingface.co/TheBloke/Mistral-3B-Instruct-v0.2-GGUF/resolve/main/mistral-3b-instruct.Q4_K_M.gguf',
  // 방법 3: 더 작은 모델
  // model: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
};
