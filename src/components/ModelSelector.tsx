import React, { useState } from 'react';
import './ModelSelector.css';

interface Props {
  onFilesSelect: (files: FileList) => void;
  isLoading: boolean;
  progress: number;
}

export function ModelSelector({ onFilesSelect, isLoading, progress }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectionStatus, setSelectionStatus] = useState<'none' | 'selected' | 'ready'>('none');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // GGUF 파일만 필터링
    if (!file.name.toLowerCase().endsWith('.gguf')) {
      alert('GGUF 파일을 선택해주세요.');
      setSelectionStatus('none');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`선택된 파일: ${file.name}, 크기: ${fileSizeMB.toFixed(2)} MB`);

    setSelectedFile(file);
    setSelectionStatus('selected');
  };

  const handleLoadFile = () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setSelectionStatus('ready');

    // FileList 객체 생성
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(selectedFile);

    onFilesSelect(dataTransfer.files);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setSelectionStatus('none');
  };

  return (
    <div className='split-model-selector'>
      <div className='selector-header'>
        <h3>🤖 모델 파일 선택</h3>
        <div className='mode-indicator'>📄 단일 파일</div>
      </div>

      {/* 선택 상태 표시 */}
      <div className={`selection-status ${selectionStatus}`}>
        {selectionStatus === 'none' && <span>📄 파일을 선택해주세요</span>}
        {selectionStatus === 'selected' && (
          <span>✅ 파일 선택됨 ({selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0'} MB)</span>
        )}
        {selectionStatus === 'ready' && <span>🚀 로딩 준비 완료</span>}
      </div>

      <div className='file-input-section'>
        <input
          type='file'
          accept='.gguf'
          onChange={handleFileChange}
          disabled={isLoading}
          className='file-input'
          id='model-file'
        />
        <label htmlFor='model-file' className='file-input-label'>
          📁 GGUF 파일 선택
        </label>
      </div>

      {selectedFile && (
        <div className='selected-files'>
          <h4>선택된 파일:</h4>
          <div className='file-item'>
            <span className='file-name'>{selectedFile.name}</span>
            <span className='file-size'>({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>

          <div className='action-buttons'>
            <button onClick={handleLoadFile} disabled={isLoading} className='load-btn'>
              {isLoading ? `로딩 중... ${progress.toFixed(1)}%` : '🚀 모델 로드'}
            </button>
            <button onClick={clearSelection} disabled={isLoading} className='clear-btn'>
              ❌ 선택 취소
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className='loading-progress'>
          <div className='progress-bar'>
            <div className='progress-fill' style={{ width: `${progress}%` }} />
          </div>
          <p>모델 로딩 중... {progress.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
