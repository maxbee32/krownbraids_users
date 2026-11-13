'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Download,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { Style } from '../types';
import { resolveImageUrl } from '../../lib/imageUrl';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

interface AITryOnProps {
  selectedStyle?: Style;
  onClose?: () => void;
  onStyleSelect?: (style: Style) => void;
}

type FlowState =
  | { phase: 'idle' }
  | { phase: 'generating' }
  | { phase: 'preview'; purchaseId: number | null; resultUrl: string; paid: boolean }
  | { phase: 'checkout'; clientSecret: string; purchaseId: number };

export default function AITryOn({
  selectedStyle,
  onClose,
  onStyleSelect,
}: AITryOnProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyleForTryOn, setSelectedStyleForTryOn] = useState<
    Style | undefined
  >(selectedStyle);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const [flow, setFlow] = useState<FlowState>({ phase: 'idle' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [isCheckingCredits, setIsCheckingCredits] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const youcamPollRef = useRef<NodeJS.Timeout | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const popularStyles: Style[] = [
    {
      id: 999,
      name: 'Classic Box Braids',
      category: 'Box Braids',
      length: 'Long',
      price: 180,
      duration: '4-5 hrs',
      rating: 4.8,
      reviews: 127,
      image: '/assets/img/style-1.jpg',
      popularity: 95,
    },
    {
      id: 1000,
      name: 'Sleek Knotless Braids',
      category: 'Knotless Braids',
      length: 'Long',
      price: 220,
      duration: '5-6 hrs',
      rating: 4.9,
      reviews: 203,
      image: '/assets/img/style-5.jpg',
      popularity: 98,
    },
    {
      id: 1001,
      name: 'Goddess Braids',
      category: 'Goddess & Protective',
      length: 'Long',
      price: 240,
      duration: '5-6 hrs',
      rating: 4.9,
      reviews: 178,
      image: '/assets/img/style-11.jpg',
      popularity: 92,
    },
    {
      id: 1002,
      name: 'Faux Locs',
      category: 'Locs',
      length: 'Long',
      price: 260,
      duration: '6-7 hrs',
      rating: 4.8,
      reviews: 201,
      image: '/assets/img/style-12.jpg',
      popularity: 90,
    },
  ];

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/try-on/credits', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setCreditsRemaining(data.remaining);
        } else {
          setCreditsRemaining(3);
        }
      } catch (err) {
        console.error('Failed to fetch credits', err);
        setCreditsRemaining(3);
      } finally {
        setIsCheckingCredits(false);
      }
    };
    fetchCredits();
  }, []);

  useEffect(() => {
    if (flow.phase === 'checkout') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [flow.phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        alert('Screenshots are disabled for this preview.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (youcamPollRef.current) clearInterval(youcamPollRef.current);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setErrorMessage(null);
        setFlow({ phase: 'idle' });
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraLoading(true);
      setVideoReady(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access.');
        setIsCameraLoading(false);
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          throw new Error('Unable to access camera.');
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.load();
        video.addEventListener('playing', () => {
          setIsCameraActive(true);
          setIsCameraLoading(false);
          setVideoReady(true);
        });
        await video.play();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow access in settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please use upload instead.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setVideoReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setSelectedImage(canvas.toDataURL('image/jpeg', 0.9));
        setErrorMessage(null);
        setFlow({ phase: 'idle' });
        stopCamera();
      }
    }
  };

  const handleTabChange = (tab: 'upload' | 'camera') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      if (selectedImage) {
        setSelectedImage(null);
        setErrorMessage(null);
        setFlow({ phase: 'idle' });
      }
      setCameraError(null);
      setIsCameraLoading(false);
      setVideoReady(false);
      startCamera();
    } else {
      stopCamera();
    }
  };

  const handleReset = () => {
    if (youcamPollRef.current) clearInterval(youcamPollRef.current);
    setSelectedImage(null);
    setErrorMessage(null);
    setFlow({ phase: 'idle' });
    stopCamera();
    setCameraError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyleForTryOn(style);
    setErrorMessage(null);
    setFlow({ phase: 'idle' });
    if (onStyleSelect) onStyleSelect(style);
  };

  const scrollStrip = (dir: -1 | 1) => {
    stripRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStyleForTryOn) return;

    setFlow({ phase: 'generating' });
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      const blob = await (await fetch(selectedImage)).blob();
      const formData = new FormData();
      formData.append('userPhoto', blob, 'selfie.jpg');
      formData.append('styleId', String(selectedStyleForTryOn.id));

      const startRes = await fetch('/api/try-on', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!startRes.ok) {
        if (startRes.status === 429) {
          setCreditsRemaining(0);
          throw new Error('Daily limit reached. Please try again tomorrow.');
        }

        const text = await startRes.text().catch(() => '');
        throw new Error(
          `Generation failed to start (${startRes.status}). ${text.slice(0, 120)}`
        );
      }
      const startData = await startRes.json().catch(() => ({}));

      if (startData.remainingCredits !== undefined) {
        setCreditsRemaining(startData.remainingCredits);
      } else {
        setCreditsRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
      }

      const taskId = startData.taskId;
      if (!taskId) throw new Error('No task ID returned.');

      let attempts = 0;
      const maxAttempts = 30;

      youcamPollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          if (youcamPollRef.current) clearInterval(youcamPollRef.current);
          setErrorMessage('Generation timed out. Please try again.');
          setFlow({ phase: 'idle' });
          return;
        }

        try {
          const statusRes = await fetch(
            `/api/try-on/status?taskId=${encodeURIComponent(taskId)}`
          );

          if (!statusRes.ok) {
            if (youcamPollRef.current) clearInterval(youcamPollRef.current);
            const text = await statusRes.text().catch(() => '');
            setErrorMessage(
              `Status check failed (${statusRes.status}). ${text.slice(0, 120)}`
            );
            setFlow({ phase: 'idle' });
            return;
          }

          const statusData = await statusRes.json().catch(() => null);
          if (!statusData) {
            if (youcamPollRef.current) clearInterval(youcamPollRef.current);
            setErrorMessage('Status endpoint returned an invalid response.');
            setFlow({ phase: 'idle' });
            return;
          }

          if (statusData.status === 'success') {
            if (youcamPollRef.current) clearInterval(youcamPollRef.current);

            let purchaseId: number | null = null;
            try {
              const recordRes = await fetch('/api/try-on/record', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  youcamTaskId: taskId,
                  resultUrl: statusData.resultUrl,
                }),
              });
              if (recordRes.ok) {
                const recordData = await recordRes.json().catch(() => ({}));
                if (recordData.purchaseId) purchaseId = recordData.purchaseId;
              }
            } catch (e) {
              console.warn('Could not record purchase:', e);
            }

            setFlow({
              phase: 'preview',
              purchaseId,
              resultUrl: statusData.resultUrl,
              paid: false,
            });
          } else if (statusData.status === 'error') {
            if (youcamPollRef.current) clearInterval(youcamPollRef.current);
            setErrorMessage(statusData.message || 'Generation failed.');
            setFlow({ phase: 'idle' });
          }
        } catch (err: any) {
          if (youcamPollRef.current) clearInterval(youcamPollRef.current);
          setErrorMessage(err.message || 'Network error during generation.');
          setFlow({ phase: 'idle' });
        }
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation failed.');
      setFlow({ phase: 'idle' });
    }
  };

  const handleUnlockDownload = async () => {
    if (flow.phase !== 'preview' || !flow.purchaseId) {
      setErrorMessage('Purchase not ready. Please try again.');
      return;
    }

    setIsStartingCheckout(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/try-on/checkout/${flow.purchaseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setFlow({ ...flow, paid: true });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      if (!data.clientSecret) throw new Error('Invalid checkout response.');

      setFlow({
        phase: 'checkout',
        clientSecret: data.clientSecret,
        purchaseId: flow.purchaseId,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not start checkout.');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const handleCheckoutComplete = () => {
    if (flow.phase !== 'checkout') return;
    const purchaseId = flow.purchaseId;

    setIsStartingCheckout(true);
    let attempts = 0;
    const maxAttempts = 10;

    const check = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setIsStartingCheckout(false);
        setErrorMessage('Payment verification timed out. Please refresh the page.');
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/try-on/purchase/${purchaseId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          const err = await res.json().catch(() => ({}));
          setIsStartingCheckout(false);
          setErrorMessage(
            err.error ||
              err.message ||
              `Access denied (${res.status}). Please log in again.`
          );
          setFlow({ phase: 'preview', purchaseId, resultUrl: '', paid: false });
          return;
        }

        if (!res.ok) {
          setTimeout(check, 1500);
          return;
        }

        const data = await res.json();
        if (data.paid && data.resultUrl) {
          setFlow({
            phase: 'preview',
            purchaseId,
            resultUrl: data.resultUrl,
            paid: true,
          });
          setIsStartingCheckout(false);
        } else {
          setTimeout(check, 1500);
        }
      } catch {
        setTimeout(check, 1500);
      }
    };

    setTimeout(check, 1500);
  };

  const handleDownload = async () => {
    if (flow.phase !== 'preview' || !flow.paid) return;

    try {
      const response = await fetch(flow.resultUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `krown-tryon-${selectedStyleForTryOn?.id || 'result'}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      setErrorMessage('Could not download the image. Please try again.');
    }
  };

  const selectedStyleThumb = selectedStyleForTryOn?.image
    ? resolveImageUrl(selectedStyleForTryOn.image)
    : '';

  const isPreview = flow.phase === 'preview';
  const isGenerating = flow.phase === 'generating';
  const isPaid = isPreview && flow.paid;
  const showResultImage = isPreview || isGenerating;

  const displayImage =
    showResultImage && flow.phase === 'preview'
      ? flow.resultUrl
      : selectedImage;

  return (
    <>
      {/* Shell — single flex column, fixed header, one scroll body */}
      <div className="bg-white rounded-3xl border border-espresso-100 overflow-hidden shadow-[0_30px_80px_-30px_rgba(42,34,31,0.45)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-5 sm:px-7 py-4 sm:py-5 border-b border-espresso-100 bg-espresso-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-espresso-950 flex items-center justify-center shrink-0 shadow-md shadow-espresso-950/20">
              <Camera className="w-5 h-5 text-primary-400" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-display font-bold text-espresso-950 truncate">
                Try On Styles
              </h2>
              <p className="text-[11px] sm:text-xs text-espresso-500 truncate">
                Preview any style on your photo in seconds
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 hover:bg-white rounded-xl transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-espresso-600" />
            </button>
          )}
        </div>

        {/* Body — only scroll container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 p-5 sm:p-7">
            {/* ─── Left: photo / upload / camera ─── */}
            <div className="lg:col-span-7">
              {!showResultImage && (
                <div className="flex gap-2 mb-4 p-1 rounded-2xl w-fit bg-espresso-50 border border-espresso-100">
                  <button
                    onClick={() => handleTabChange('upload')}
                    className={`py-2 px-5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'upload'
                        ? 'bg-espresso-950 text-white shadow-sm'
                        : 'text-espresso-700 hover:bg-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" strokeWidth={2.2} /> Upload
                  </button>
                  <button
                    onClick={() => handleTabChange('camera')}
                    className={`py-2 px-5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'camera'
                        ? 'bg-espresso-950 text-white shadow-sm'
                        : 'text-espresso-700 hover:bg-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" strokeWidth={2.2} /> Camera
                  </button>
                </div>
              )}

              {!displayImage ? (
                <div>
                  {/* Upload dropzone — square, capped height */}
                  {activeTab === 'upload' && (
                    <label className="w-full aspect-square max-h-[55vh] rounded-3xl border-2 border-dashed border-espresso-200 hover:border-primary-400 transition-colors bg-gradient-to-br from-espresso-50 to-white flex flex-col items-center justify-center gap-4 cursor-pointer p-8">
                      <div className="w-20 h-20 rounded-full bg-white border border-espresso-200 flex items-center justify-center shadow-sm">
                        <Upload
                          className="w-8 h-8 text-espresso-950"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-espresso-950 text-base">
                          Upload a photo
                        </p>
                        <p className="text-xs text-espresso-500 mt-1">
                          JPG or PNG, up to 10MB
                        </p>
                        <p className="text-xs text-primary-600 mt-3 font-semibold">
                          Click to browse files
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Live camera */}
                  <div
                    className="relative rounded-3xl overflow-hidden bg-black mx-auto aspect-square max-h-[55vh]"
                    style={{
                      display:
                        activeTab === 'camera' && isCameraActive
                          ? 'block'
                          : 'none',
                    }}
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      autoPlay
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
                      <button
                        onClick={capturePhoto}
                        className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                        disabled={!videoReady}
                        aria-label="Capture photo"
                      >
                        <Camera
                          className="w-7 h-7 text-espresso-950"
                          strokeWidth={2.2}
                        />
                      </button>
                      <button
                        onClick={stopCamera}
                        className="p-4 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform text-white"
                        aria-label="Stop camera"
                      >
                        <X className="w-5 h-5" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  {/* Camera loading */}
                  {activeTab === 'camera' && isCameraLoading && !isCameraActive && (
                    <div className="aspect-square max-h-[55vh] flex flex-col items-center justify-center rounded-3xl border-2 border-espresso-100 bg-gradient-to-br from-espresso-50 to-white">
                      <Loader2 className="w-10 h-10 text-espresso-950 animate-spin mb-3" />
                      <p className="text-espresso-950 font-medium">
                        Starting camera…
                      </p>
                    </div>
                  )}

                  {/* Camera error */}
                  {activeTab === 'camera' && cameraError && !isCameraActive && (
                    <div className="aspect-square max-h-[55vh] flex flex-col items-center justify-center bg-red-50 rounded-3xl border-2 border-red-200 px-6 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                      <p className="text-red-700 font-medium mb-3">
                        {cameraError}
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-2.5 bg-espresso-950 hover:bg-primary-500 hover:text-espresso-950 text-white rounded-xl flex items-center gap-2 font-semibold transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" strokeWidth={2.2} /> Try
                        Again
                      </button>
                    </div>
                  )}

                  {/* Camera idle */}
                  {activeTab === 'camera' &&
                    !isCameraLoading &&
                    !isCameraActive &&
                    !cameraError && (
                      <button
                        onClick={startCamera}
                        className="w-full aspect-square max-h-[55vh] rounded-3xl border-2 border-dashed border-espresso-200 hover:border-primary-400 transition-colors bg-gradient-to-br from-espresso-50 to-white flex flex-col items-center justify-center gap-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-white border border-espresso-200 flex items-center justify-center shadow-sm">
                          <Camera
                            className="w-8 h-8 text-espresso-950"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-espresso-950 text-base">
                            Start Camera
                          </p>
                          <p className="text-xs text-espresso-500 mt-1">
                            Take a selfie
                          </p>
                        </div>
                      </button>
                    )}
                </div>
              ) : (
                /* Result image */
                <div
                  className="relative rounded-3xl overflow-hidden bg-espresso-50 mx-auto select-none aspect-square max-h-[55vh] border border-espresso-100 shadow-[0_20px_50px_-20px_rgba(42,34,31,0.35)]"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image
                    src={displayImage}
                    alt={isPreview ? 'AI Try-On Result' : 'Your photo'}
                    fill
                    className="object-cover pointer-events-none"
                    unoptimized={isPreview}
                    draggable={false}
                  />

                  {isGenerating && (
                    <div className="absolute inset-0 bg-espresso-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6 z-30">
                      <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
                      <p className="mt-4 text-sm font-semibold text-white">
                        Generating your preview…
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        This takes about 10 seconds
                      </p>
                    </div>
                  )}

                  {isPreview && !isPaid && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-25 z-20">
                      <p className="text-white text-4xl font-bold uppercase tracking-widest rotate-[-30deg] whitespace-nowrap drop-shadow-lg">
                        Preview
                      </p>
                    </div>
                  )}

                  <div
                    className="absolute inset-0 z-20"
                    onContextMenu={(e) => e.preventDefault()}
                  />

                  {isPreview && (
                    <div
                      className={`absolute top-4 right-4 z-30 px-3 py-1.5 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg ${
                        isPaid ? 'bg-emerald-500' : 'bg-espresso-950'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {isPaid ? 'Unlocked' : 'Preview ready'}
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 z-30">
                    <button
                      onClick={handleReset}
                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                      aria-label="Reset photo"
                    >
                      <RotateCcw
                        className="w-5 h-5 text-espresso-950"
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* ─── Right: picker + CTA ─── */}
            <div className="lg:col-span-5 flex flex-col">
              {/* Selected style summary */}
              <div className="rounded-2xl p-3 mb-4 flex items-center gap-3 border border-espresso-100 bg-espresso-50">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-espresso-100 shrink-0 shadow-sm">
                  {selectedStyleThumb ? (
                    <Image
                      src={selectedStyleThumb}
                      alt={selectedStyleForTryOn?.name || ''}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-espresso-300">
                      <ImageIcon className="w-6 h-6" strokeWidth={2} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-primary-600">
                    Selected style
                  </p>
                  <p className="text-sm font-display font-bold text-espresso-950 truncate">
                    {selectedStyleForTryOn?.name || 'None yet'}
                  </p>
                  <p className="text-[11px] text-espresso-500 truncate">
                    {selectedStyleForTryOn?.category || 'Pick one below'}
                  </p>
                </div>
                {selectedStyleForTryOn && !isPreview && !isGenerating && (
                  <button
                    onClick={() => {
                      setSelectedStyleForTryOn(undefined);
                      setErrorMessage(null);
                      setFlow({ phase: 'idle' });
                    }}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    aria-label="Clear selected style"
                  >
                    <X className="w-4 h-4 text-espresso-500" strokeWidth={2.2} />
                  </button>
                )}
              </div>

              {/* Style strip */}
              {flow.phase === 'idle' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-espresso-700">
                      Popular styles
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => scrollStrip(-1)}
                        className="p-1 rounded-md hover:bg-espresso-100 text-espresso-600"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2.2} />
                      </button>
                      <button
                        onClick={() => scrollStrip(1)}
                        className="p-1 rounded-md hover:bg-espresso-100 text-espresso-600"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-4 h-4" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={stripRef}
                    className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                  >
                    {popularStyles.map((style) => {
                      const styleThumb = resolveImageUrl(style.image);
                      const isSelected = selectedStyleForTryOn?.id === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => handleStyleSelect(style)}
                          className={`group snap-start shrink-0 w-32 text-left rounded-2xl overflow-hidden transition-all ${
                            isSelected
                              ? 'border-2 border-primary-500 ring-2 ring-primary-200 bg-primary-50'
                              : 'border border-espresso-100 bg-white hover:shadow-md hover:border-primary-300'
                          }`}
                        >
                          <div className="relative w-full aspect-[4/5] bg-espresso-100 overflow-hidden">
                            {styleThumb ? (
                              <Image
                                src={styleThumb}
                                alt={style.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-espresso-300">
                                <ImageIcon className="w-8 h-8" strokeWidth={2} />
                              </div>
                            )}
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary-500 text-espresso-950 flex items-center justify-center shadow">
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold text-espresso-950 truncate">
                              {style.name}
                            </p>
                            <p className="text-[10px] text-espresso-500 truncate">
                              {style.category}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-auto pt-4 border-t border-espresso-100">
                {flow.phase === 'idle' && (
                  <>
                    <button
                      onClick={handleGenerate}
                      disabled={
                        !selectedImage ||
                        !selectedStyleForTryOn ||
                        isCheckingCredits ||
                        creditsRemaining === 0
                      }
                      className="w-full py-3.5 bg-espresso-950 text-white font-semibold rounded-2xl transition-all hover:bg-primary-500 hover:text-espresso-950 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-espresso-950 disabled:hover:text-white flex items-center justify-center gap-2"
                    >
                      {isCheckingCredits ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Checking
                          limits…
                        </>
                      ) : creditsRemaining === 0 ? (
                        <>
                          <Lock className="w-5 h-5" strokeWidth={2.2} /> Daily
                          limit reached
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" strokeWidth={2.2} />{' '}
                          Generate preview
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-[11px] text-espresso-400 text-center">
                      {isCheckingCredits
                        ? 'Loading…'
                        : creditsRemaining !== null
                        ? creditsRemaining > 0
                          ? `${creditsRemaining} free previews left today`
                          : 'Limit reached · resets tomorrow'
                        : 'Free to preview'}
                    </p>
                  </>
                )}

                {flow.phase === 'generating' && (
                  <div className="w-full py-5 rounded-2xl bg-espresso-50 border border-espresso-100 text-center">
                    <Loader2 className="w-6 h-6 text-espresso-950 animate-spin mx-auto" />
                    <p className="mt-2 text-sm font-semibold text-espresso-950">
                      Generating your preview
                    </p>
                    <p className="text-xs text-espresso-500 mt-0.5">
                      About 10 seconds
                    </p>
                  </div>
                )}

                {flow.phase === 'preview' && (
                  <>
                    {!flow.paid ? (
                      <button
                        onClick={handleUnlockDownload}
                        disabled={isStartingCheckout || !flow.purchaseId}
                        className="w-full py-3.5 bg-espresso-950 text-white font-semibold rounded-2xl transition-all hover:bg-primary-500 hover:text-espresso-950 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-espresso-950 disabled:hover:text-white"
                      >
                        {isStartingCheckout ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Starting
                            checkout…
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" strokeWidth={2.2} /> Unlock
                            download
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleDownload}
                        className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-2xl transition-all hover:bg-emerald-700 hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" strokeWidth={2.2} />{' '}
                        Download image
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setFlow({ phase: 'idle' });
                        setErrorMessage(null);
                      }}
                      className="mt-2 w-full py-2.5 text-sm font-medium text-espresso-700 border border-espresso-200 rounded-xl hover:bg-espresso-50 transition-colors"
                    >
                      Try another style
                    </button>
                  </>
                )}

                {!selectedImage && flow.phase === 'idle' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-espresso-50 border border-espresso-100">
                    <p className="text-xs text-espresso-600 text-center flex items-center justify-center gap-1.5 font-medium">
                      <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
                      Upload or take a photo to get started
                    </p>
                  </div>
                )}

                {selectedImage && !selectedStyleForTryOn && flow.phase === 'idle' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-primary-50 border border-primary-200">
                    <p className="text-xs text-primary-700 text-center font-medium">
                      Select a hairstyle above to try on
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {flow.phase === 'checkout' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            <div className="px-6 py-4 border-b border-espresso-100 flex items-center justify-between bg-espresso-50 rounded-t-3xl shrink-0">
              <div>
                <h3 className="text-lg font-bold text-espresso-950">
                  Unlock Download
                </h3>
                <p className="text-xs text-espresso-500 mt-0.5">
                  One-time payment to unlock your preview
                </p>
              </div>
              <button
                onClick={() =>
                  setFlow({
                    phase: 'preview',
                    purchaseId: flow.purchaseId,
                    resultUrl: '',
                    paid: false,
                  })
                }
                className="p-2 bg-white hover:bg-espresso-100 rounded-full transition-colors shadow-sm"
                aria-label="Cancel checkout"
              >
                <X className="w-5 h-5 text-espresso-500" strokeWidth={2.2} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto w-full">
              {isStartingCheckout ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="w-10 h-10 text-espresso-950 animate-spin mb-4" />
                  <p className="font-semibold text-espresso-950">
                    Verifying payment…
                  </p>
                  <p className="text-sm text-espresso-500 mt-1">
                    Please wait a moment.
                  </p>
                </div>
              ) : (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    clientSecret: flow.clientSecret,
                    onComplete: handleCheckoutComplete,
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}