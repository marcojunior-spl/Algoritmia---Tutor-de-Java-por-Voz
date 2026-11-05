import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RotateCcw, Sparkles } from 'lucide-react';

interface ImageCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendImage: (base64Jpeg: string, promptText: string) => void;
}

export const ImageCaptureModal: React.FC<ImageCaptureModalProps> = ({
  isOpen,
  onClose,
  onSendImage,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when camera tab is active and modal is open
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedImage]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Não foi possível acessar a câmera do dispositivo. Você pode enviar uma foto pelo upload.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      setCapturedImage(base64);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setCapturedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!capturedImage) return;
    const defaultPrompt = caption.trim() || 'Analise esta imagem de exercício/caderno de Java e me ajude a raciocinar.';
    onSendImage(capturedImage, defaultPrompt);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCaption('');
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Enviar Foto do Exercício ou Caderno
              </h3>
              <span className="text-[11px] text-slate-400">
                O Gemini Live analisará visualmente o exercício em tempo real
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher if no image captured yet */}
        {!capturedImage && (
          <div className="flex items-center border-b border-slate-800 bg-slate-950/40 p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Arquivo de Imagem</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Tirar Foto com a Câmera</span>
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 flex flex-col gap-4">
          {capturedImage ? (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-video max-h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={`data:image/jpeg;base64,${capturedImage}`}
                  alt="Foto capturada"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Trocar Foto</span>
                </button>
              </div>

              {/* Optional Caption */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Qual é sua dúvida sobre este exercício? (Opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Não entendi como balancear esta árvore ou se o tempo é O(n)..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="flex flex-col items-center gap-3">
              {cameraError ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl w-full text-center">
                  {cameraError}
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraActive && (
                    <span className="text-xs text-slate-500">Iniciando câmera...</span>
                  )}
                </div>
              )}

              {isCameraActive && (
                <button
                  onClick={handleSnapPhoto}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Imagem</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl transition-colors text-center bg-slate-950/40">
              <Upload className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs text-slate-300 font-medium mb-1">
                Clique para selecionar uma foto ou print
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                Formatos aceitos: JPG, PNG, WEBP (fotos do caderno, enunciados, testes)
              </p>
              <label className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shadow-sm shadow-amber-500/20">
                <span>Escolher Imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!capturedImage}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enviar ao Tutor por Voz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
