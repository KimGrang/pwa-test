// import React from 'react';

// interface Props {
//   selectedModel: string;
//   onModelSelect: (model: string) => void;
//   onLoadRemoteModel: () => void;
//   onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   isModelLoading: boolean;
//   availableModels: string[];
// }

// const ModelSelector: React.FC<Props> = ({
//   selectedModel,
//   onModelSelect,
//   onLoadRemoteModel,
//   onFileUpload,
//   isModelLoading,
//   availableModels,
// }) => {
//   return (
//     <div className='model-selector'>
//       {/* 모델 로딩 방법들 */}
//       <div className='model-loading-methods'>
//         {/* 원격 모델 로딩 */}
//         <div className='model-section'>
//           <h3>🌐 원격 모델</h3>
//           <div className='model-controls'>
//             <label htmlFor='model-select' className='model-select-label'>
//               사용할 AI 모델을 선택하세요:
//             </label>
//             <div className='model-controls-row'>
//               <select
//                 id='model-select'
//                 value={selectedModel}
//                 onChange={(e) => onModelSelect(e.target.value)}
//                 className='model-select'
//                 disabled={isModelLoading}
//                 aria-label='AI 모델 선택'
//               >
//                 {availableModels.map((model) => {
//                   // URL에서 파일명 추출하여 표시
//                   const fileName = model.split('/').pop() || model;
//                   return (
//                     <option key={model} value={model}>
//                       {fileName} (1.64GB)
//                     </option>
//                   );
//                 })}
//               </select>
//               <button
//                 onClick={() => {
//                   onLoadRemoteModel();
//                 }}
//                 disabled={isModelLoading}
//                 className='load-model-btn'
//               >
//                 원격 모델 로드
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 구분선 */}
//         <div className='model-divider'>
//           <span>또는</span>
//         </div>

//         {/* 파일 업로드 모델 로딩 */}
//         <div className='model-section'>
//           <h3>📁 파일 업로드</h3>
//           <div className='model-warning'>
//             <p>✅ 컴퓨터에서 GGUF 파일을 직접 선택하여 업로드할 수 있습니다.</p>
//           </div>
//           <div className='model-controls'>
//             <input
//               type='file'
//               accept='.gguf'
//               onChange={onFileUpload}
//               disabled={isModelLoading}
//               className='file-input'
//               id='model-file-input'
//             />
//             <label htmlFor='model-file-input' className='file-input-label'>
//               GGUF 파일 선택
//             </label>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModelSelector;
