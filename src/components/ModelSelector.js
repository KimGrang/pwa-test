import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './ModelSelector.css';
export function ModelSelector({ onFilesSelect, isLoading, progress }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectionStatus, setSelectionStatus] = useState('none');
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0)
            return;
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
    return (_jsxs("div", { className: 'split-model-selector', children: [_jsxs("div", { className: 'selector-header', children: [_jsx("h3", { children: "\uD83E\uDD16 \uBAA8\uB378 \uD30C\uC77C \uC120\uD0DD" }), _jsx("div", { className: 'mode-indicator', children: "\uD83D\uDCC4 \uB2E8\uC77C \uD30C\uC77C" })] }), _jsxs("div", { className: `selection-status ${selectionStatus}`, children: [selectionStatus === 'none' && _jsx("span", { children: "\uD83D\uDCC4 \uD30C\uC77C\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694" }), selectionStatus === 'selected' && (_jsxs("span", { children: ["\u2705 \uD30C\uC77C \uC120\uD0DD\uB428 (", selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0', " MB)"] })), selectionStatus === 'ready' && _jsx("span", { children: "\uD83D\uDE80 \uB85C\uB529 \uC900\uBE44 \uC644\uB8CC" })] }), _jsxs("div", { className: 'file-input-section', children: [_jsx("input", { type: 'file', accept: '.gguf', onChange: handleFileChange, disabled: isLoading, className: 'file-input', id: 'model-file' }), _jsx("label", { htmlFor: 'model-file', className: 'file-input-label', children: "\uD83D\uDCC1 GGUF \uD30C\uC77C \uC120\uD0DD" })] }), selectedFile && (_jsxs("div", { className: 'selected-files', children: [_jsx("h4", { children: "\uC120\uD0DD\uB41C \uD30C\uC77C:" }), _jsxs("div", { className: 'file-item', children: [_jsx("span", { className: 'file-name', children: selectedFile.name }), _jsxs("span", { className: 'file-size', children: ["(", (selectedFile.size / (1024 * 1024)).toFixed(2), " MB)"] })] }), _jsxs("div", { className: 'action-buttons', children: [_jsx("button", { onClick: handleLoadFile, disabled: isLoading, className: 'load-btn', children: isLoading ? `로딩 중... ${progress.toFixed(1)}%` : '🚀 모델 로드' }), _jsx("button", { onClick: clearSelection, disabled: isLoading, className: 'clear-btn', children: "\u274C \uC120\uD0DD \uCDE8\uC18C" })] })] })), isLoading && (_jsxs("div", { className: 'loading-progress', children: [_jsx("div", { className: 'progress-bar', children: _jsx("div", { className: 'progress-fill', style: { width: `${progress}%` } }) }), _jsxs("p", { children: ["\uBAA8\uB378 \uB85C\uB529 \uC911... ", progress.toFixed(1), "%"] })] }))] }));
}
