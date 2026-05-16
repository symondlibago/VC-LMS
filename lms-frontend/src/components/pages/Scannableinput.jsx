import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScanLine, X, Loader2, CheckCircle, AlertTriangle, Camera, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';

const ScannerModal = ({ isOpen, onClose, onResult, scanMode, label }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const ocrWorkerRef = useRef(null);

  const [status, setStatus] = useState('initializing'); 
  const [statusMsg, setStatusMsg] = useState('Starting camera...');
  const [scannedValue, setScannedValue] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); 

  // Box heights: 40% for multi-line text (Titles), 20% for single-line codes (ISBNs)
  const isTextMode = scanMode === 'text';
  const boxHeightPercent = isTextMode ? 0.40 : 0.20; 
  const boxHeightClass = isTextMode ? 'h-[40%]' : 'h-[20%]';

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          advanced: [{ focusMode: "continuous" }] 
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('scanning');
        setStatusMsg('Hold steady. Align text inside the box.');
        setCameraError('');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access camera. Please allow permissions.');
      setStatus('error');
    }
  }, [facingMode]);

  // ── Pre-process Image (Binarization & Contrast) ─────────────────────────────
  const applyImageEnhancements = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and apply high contrast threshold
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Standard grayscale conversion
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Boost contrast heavily to eliminate shadows/background gradients
      gray = ((gray - 128) * 2.0) + 128; 
      
      if (gray > 255) gray = 255;
      if (gray < 0) gray = 0;

      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  // ── OCR capture & Crop ──────────────────────────────────────────────────────
  const captureAndOCR = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus('processing');
    setStatusMsg('Enhancing & Reading...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Calculate EXACT visual bounding box to fix the object-fit: cover misalignment
    const rect = video.getBoundingClientRect();
    const scaleFactor = 2; // Double resolution for Tesseract accuracy

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.width * scaleFactor;
    tempCanvas.height = rect.height * scaleFactor;
    const tempCtx = tempCanvas.getContext('2d');

    // Math to simulate CSS object-fit: cover
    const scale = Math.max((rect.width * scaleFactor) / video.videoWidth, (rect.height * scaleFactor) / video.videoHeight);
    const drawW = video.videoWidth * scale;
    const drawH = video.videoHeight * scale;
    const drawX = ((rect.width * scaleFactor) - drawW) / 2;
    const drawY = ((rect.height * scaleFactor) - drawH) / 2;

    tempCtx.drawImage(video, drawX, drawY, drawW, drawH);

    // Extract ONLY the exact area corresponding to the red box
    const cropW = (rect.width * 0.8) * scaleFactor;
    const cropH = (rect.height * boxHeightPercent) * scaleFactor;
    const cropX = ((rect.width * scaleFactor) - cropW) / 2;
    const cropY = ((rect.height * scaleFactor) - cropH) / 2;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    
    // Draw cropped area and enhance
    ctx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    applyImageEnhancements(canvas);

    try {
      if (!ocrWorkerRef.current) {
        setStatusMsg('Loading OCR engine...');
        const worker = await createWorker('eng');
        // PSM 6 tells Tesseract to assume a single uniform block of text, preventing weird edge hallucinations
        await worker.setParameters({ tessedit_pageseg_mode: '6' });
        ocrWorkerRef.current = worker;
      }

      const { data } = await ocrWorkerRef.current.recognize(canvas);
      let rawText = data.text.trim();

      if (!rawText) {
        setStatus('error');
        setCameraError('No text found. Try better lighting or hold closer.');
        return;
      }

      // ─── Sanitize Output ───────────────────────────────────────────────────
      
      if (scanMode === 'code') {
        // Strip out completely invalid characters
        rawText = rawText.replace(/[^a-zA-Z0-9\-\.\s:]/g, '');
        // Fix common OCR typos in numbers
        rawText = rawText.replace(/O/g, '0').replace(/l/g, '1').replace(/I/g, '1');
        // Remove the word "ISBN" if the camera caught it
        rawText = rawText.replace(/^ISBN[\s:]*/i, '');
        // Fix spaces around dashes (e.g. "978 - 621" -> "978-621")
        rawText = rawText.replace(/\s*-\s*/g, '-');
      } else {
        // Remove stray UI/background hallucinations common in Titles
        rawText = rawText.replace(/\|/g, '').replace(/_/g, '').replace(/~/g, '');
      }

      // Condense spaces/newlines
      let cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

      if (!cleaned) {
        setStatus('error');
        setCameraError('Text was too blurry. Try again.');
        return;
      }

      setScannedValue(cleaned);
      setStatus('success');
      setStatusMsg(`Detected successfully!`);
    } catch (err) {
      console.error('OCR error:', err);
      setCameraError('OCR failed. Please try again.');
      setStatus('error');
    }
  }, [scanMode, boxHeightPercent]);

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStatus('initializing');
      setStatusMsg('Starting camera...');
      setScannedValue('');
      setCameraError('');
      startCamera();
    }
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isOpen, startCamera]);

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    setStatus('initializing');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#7f1d1d] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <ScanLine className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white font-bold text-sm">Scan {label}</h3>
              <p className="text-red-200 text-xs">
                {isTextMode ? 'Multiline Text Scanner' : 'Alphanumeric Code Scanner'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

          {/* Guide Overlay */}
          {status === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-black/50" />
              
              <div className={`relative w-[80%] ${boxHeightClass} border border-white/30 rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] bg-transparent transition-all duration-300`}>
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#ef4444] rounded-tl-md" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#ef4444] rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#ef4444] rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#ef4444] rounded-br-md" />
                
                {/* Horizontal scan line visual */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <p className="text-white text-sm font-medium">{statusMsg}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 p-6 overflow-y-auto">
              <CheckCircle className="w-12 h-12 text-emerald-400 shrink-0" />
              <p className="text-white text-lg text-center font-bold break-words w-full">
                {scannedValue}
              </p>
            </div>
          )}

          {status === 'scanning' && (
            <button onClick={handleFlipCamera} className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hidden Canvas used for OCR processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Status bar */}
        <div className={`px-4 py-2.5 flex items-center gap-2 text-xs font-medium shrink-0 ${
          status === 'success' ? 'bg-emerald-50 text-emerald-700' :
          status === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
        }`}>
          {status === 'scanning' && <ScanLine className="w-4 h-4 text-[#991b1b]" />}
          {status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-4 h-4" />}
          {status === 'error' && <AlertTriangle className="w-4 h-4" />}
          <span>{cameraError || statusMsg}</span>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white border-t flex gap-2 shrink-0">
          {status === 'success' ? (
            <>
              <button onClick={() => setStatus('scanning')} className="flex-1 px-4 py-3 border rounded-lg text-gray-700 hover:bg-gray-50 font-bold">Scan Again</button>
              <button onClick={() => { onResult(scannedValue); onClose(); }} className="flex-1 px-4 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white rounded-lg font-bold">Use This Value</button>
            </>
          ) : status === 'scanning' ? (
            <>
              <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-lg text-gray-700 hover:bg-gray-50 font-bold">Cancel</button>
              <button onClick={captureAndOCR} className="flex-1 px-4 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white rounded-lg font-bold flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Capture
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-lg text-gray-700 hover:bg-gray-50 font-bold">Cancel</button>
              {status === 'error' && <button onClick={() => setStatus('scanning')} className="flex-1 px-4 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white rounded-lg font-bold">Try Again</button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ScannableInput = ({ label, value, onChange, placeholder = '', type = 'text', readOnly = false, scanMode, disabled = false }) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const canScan = !!scanMode && !readOnly && !disabled;

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1 flex items-center gap-1.5">
        {label}
        {canScan && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
            scanMode === 'code' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {scanMode === 'code' ? 'CODE / ID' : 'TEXT'}
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type={type} value={value} onChange={e => !readOnly && !disabled && onChange(e.target.value)}
          placeholder={placeholder} readOnly={readOnly} disabled={disabled}
          className={`w-full border border-gray-200 rounded-lg text-sm transition-all outline-none
            ${canScan ? 'pl-3 pr-9 py-1.5' : 'px-3 py-1.5'}
            ${readOnly || disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b]'}
          `}
        />
        {canScan && (
          <button type="button" onClick={() => setScannerOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-blue-500 hover:bg-blue-50">
            <ScanLine className="w-4 h-4" />
          </button>
        )}
      </div>

      {scannerOpen && (
        <ScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} onResult={onChange} scanMode={scanMode} label={label} />
      )}
    </div>
  );
};

export const InputGroup = ({ label, value, onChange, placeholder = '', type = 'text', readOnly = false }) => (
  <ScannableInput label={label} value={value} onChange={onChange} placeholder={placeholder} type={type} readOnly={readOnly} />
);