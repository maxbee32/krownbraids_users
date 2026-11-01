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
  User,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { Style } from '../types';
import { resolveImageUrl } from '../../lib/imageUrl';

interface AITryOnProps {
  selectedStyle?: Style;
  onClose?: () => void;
  onStyleSelect?: (style: Style) => void;
}

export default function AITryOn({
  selectedStyle,
  onClose,
  onStyleSelect,
}: AITryOnProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [selectedStyleForTryOn, setSelectedStyleForTryOn] = useState<
    Style | undefined
  >(selectedStyle);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [cameraAttempts, setCameraAttempts] = useState<number>(0);
  const [videoReady, setVideoReady] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsComplete(false);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraLoading(true);
      setCameraAttempts((prev) => prev + 1);
      setVideoReady(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Your browser does not support camera access. Please use a different browser or upload a photo.'
        );
        setIsCameraLoading(false);
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (simpleError) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (defaultError) {
          throw new Error(
            'Unable to access camera. Please check your camera connection.'
          );
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');

        await video.load();

        const handleCanPlay = () => setVideoReady(true);
        const handlePlaying = () => {
          setIsCameraActive(true);
          setIsCameraLoading(false);
          setVideoReady(true);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('playing', handlePlaying);

        try {
          await video.play();
        } catch (playError) {
          console.error('Video play error:', playError);
          setTimeout(async () => {
            try {
              await video.play();
              setIsCameraActive(true);
              setIsCameraLoading(false);
              setVideoReady(true);
            } catch (retryError) {
              console.error('Retry play error:', retryError);
              setCameraError(
                'Unable to play video stream. Please try again.'
              );
              setIsCameraLoading(false);
            }
          }, 500);
        }
      } else {
        setCameraError(
          'Video element not found. Please refresh and try again.'
        );
        setIsCameraLoading(false);
      }
    } catch (err: any) {
      console.error('Camera error details:', err);

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        setCameraError(
          'Camera access denied. Please allow camera access in your browser settings.'
        );
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        setCameraError(
          'No camera found. Please connect a camera or use the upload option.'
        );
      } else if (
        err.name === 'NotReadableError' ||
        err.name === 'TrackStartError'
      ) {
        setCameraError(
          'Camera is busy or not responding. Please close other apps using the camera and try again.'
        );
      } else if (err.message?.includes('secure origin')) {
        setCameraError(
          'Camera requires a secure connection (HTTPS). Please use the upload option.'
        );
      } else {
        setCameraError(
          `Unable to access camera: ${
            err.message || 'Unknown error'
          }. Please use upload instead.`
        );
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

      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(photoData);
        setIsComplete(false);
        stopCamera();
      }
    }
  };

  const handleTryOn = () => {
    if (!selectedImage || !selectedStyleForTryOn) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 3000);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setIsComplete(false);
    stopCamera();
    setCameraError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyleForTryOn(style);
    if (onStyleSelect) {
      onStyleSelect(style);
    }
  };

  const handleTabChange = (tab: 'upload' | 'camera') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      if (selectedImage) {
        setSelectedImage(null);
        setIsComplete(false);
      }
      setCameraAttempts(0);
      setIsCameraActive(false);
      setCameraError(null);
      setIsCameraLoading(false);
      setVideoReady(false);
      startCamera();
    } else {
      stopCamera();
    }
  };

  const selectedStyleThumb = resolveImageUrl(selectedStyleForTryOn?.image);

  return (
    <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-[0_25px_50px_-12px_rgba(122,38,65,0.25)]">
      {/* Header */}
      <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-cream-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-plum-700 flex items-center justify-center shadow-sm shadow-plum-700/25">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink-900">
              Try On Styles
            </h2>
            <p className="text-xs text-ink-500">
              Upload or take a photo to try styles
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-plum-50 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-ink-600" />
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Upload & Preview */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink-900 mb-1">
                Your Photo
              </h3>
              <p className="text-xs text-ink-500">
                Upload or take a photo for the best results
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-4 p-1 bg-plum-50 rounded-2xl border border-plum-100">
              <button
                onClick={() => handleTabChange('upload')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'upload'
                    ? 'bg-plum-700 text-white shadow-sm shadow-plum-700/25'
                    : 'text-plum-700 hover:bg-plum-100'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => handleTabChange('camera')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'camera'
                    ? 'bg-plum-700 text-white shadow-sm shadow-plum-700/25'
                    : 'text-plum-700 hover:bg-plum-100'
                }`}
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
            </div>

            {!selectedImage ? (
              <div className="relative">
                {/* Upload State */}
                {activeTab === 'upload' && (
                  <label className="w-full py-16 border-2 border-dashed border-cream-300 rounded-2xl hover:border-plum-400 transition-colors bg-cream-50 hover:bg-plum-50 flex flex-col items-center gap-3 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-white border border-cream-200 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-plum-700" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-ink-900">
                        Upload a photo
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        JPG or PNG, up to 10MB
                      </p>
                      <p className="text-xs text-plum-700 mt-2 font-semibold">
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

                {/* Camera State */}
                <div
                  className={`relative rounded-2xl overflow-hidden bg-black ${
                    activeTab === 'camera' && isCameraActive ? '' : 'hidden'
                  }`}
                >
                  <video
                    ref={videoRef}
                    className="w-full aspect-[3/4] object-cover"
                    playsInline
                    autoPlay
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <button
                      onClick={capturePhoto}
                      className="px-8 py-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!videoReady}
                      aria-label="Capture photo"
                    >
                      <Camera className="w-7 h-7 text-plum-700" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-4 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform text-white"
                      aria-label="Stop camera"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Live
                  </div>
                  {!videoReady && isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Loading Spinner */}
                {activeTab === 'camera' &&
                  isCameraLoading &&
                  !isCameraActive && (
                    <div className="text-center py-16 bg-cream-50 rounded-2xl border-2 border-cream-200">
                      <Loader2 className="w-10 h-10 text-plum-700 animate-spin mx-auto mb-3" />
                      <p className="text-ink-900 font-medium">
                        Starting camera…
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        Please allow camera access
                      </p>
                      <p className="text-xs text-ink-500 mt-2">
                        Check your browser permissions
                      </p>
                    </div>
                  )}

                {/* Error State */}
                {activeTab === 'camera' &&
                  cameraError &&
                  !isCameraActive && (
                    <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border-2 border-red-200">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-700 font-medium mb-2">
                        {cameraError}
                      </p>
                      <p className="text-xs text-ink-600 mb-4">
                        Tips:
                        <br />
                        • Make sure your camera is connected and not being used
                        by another app
                        <br />• Allow camera access in your browser settings
                        <br />• Try refreshing the page
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          onClick={startCamera}
                          className="px-6 py-2 bg-plum-700 text-white rounded-xl hover:bg-plum-800 transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                        <button
                          onClick={() => handleTabChange('upload')}
                          className="px-6 py-2 bg-white text-plum-700 border border-plum-200 rounded-xl hover:bg-plum-50 transition-colors"
                        >
                          Use Upload Instead
                        </button>
                      </div>
                    </div>
                  )}

                {/* Start Camera Button */}
                {activeTab === 'camera' &&
                  !isCameraLoading &&
                  !isCameraActive &&
                  !cameraError && (
                    <button
                      onClick={startCamera}
                      className="w-full py-16 border-2 border-dashed border-cream-300 rounded-2xl hover:border-plum-400 transition-colors bg-cream-50 hover:bg-plum-50 flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-white border border-cream-200 flex items-center justify-center">
                        <Camera className="w-7 h-7 text-plum-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-ink-900">
                          Start Camera
                        </p>
                        <p className="text-xs text-ink-500 mt-1">
                          Take a selfie
                        </p>
                        <p className="text-xs text-plum-700 mt-2 font-semibold">
                          Click to access your camera
                        </p>
                      </div>
                    </button>
                  )}
              </div>
            ) : (
              // Image Preview
              <div className="relative rounded-2xl overflow-hidden bg-cream-100 border border-cream-200">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={selectedImage}
                    alt="Your photo"
                    fill
                    className="object-cover"
                  />
                  {isComplete && (
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-900/55 via-transparent to-transparent" />
                  )}
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                    aria-label="Reset photo"
                  >
                    <RotateCcw className="w-5 h-5 text-plum-700" />
                  </button>
                </div>

                {isComplete && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Check className="w-3 h-3" />
                    Complete
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Style Selection & Results */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink-900 mb-1">
                Select a Style
              </h3>
              <p className="text-xs text-ink-500">
                Choose a hairstyle to try on
              </p>
            </div>

            {/* Selected style preview */}
            <div className="bg-cream-50 rounded-2xl p-4 mb-4 border border-cream-200">
              {selectedStyleForTryOn ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-cream-200 flex-shrink-0">
                    {selectedStyleThumb ? (
                      <Image
                        src={selectedStyleThumb}
                        alt={selectedStyleForTryOn.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-plum-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 truncate text-base">
                      {selectedStyleForTryOn.name}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {selectedStyleForTryOn.category}
                    </p>
                    <p className="text-base font-bold text-plum-700 mt-1">
                      £{selectedStyleForTryOn.price}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStyleForTryOn(undefined)}
                    className="self-start p-1.5 hover:bg-plum-50 rounded-lg transition-colors"
                    aria-label="Clear selected style"
                  >
                    <X className="w-4 h-4 text-ink-500" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-plum-200 mx-auto mb-2" />
                  <p className="text-sm text-ink-500">No style selected</p>
                  <p className="text-xs text-ink-400 mt-1">
                    Choose from popular styles below
                  </p>
                </div>
              )}
            </div>

            {/* Popular styles grid */}
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto mb-4 pr-1">
              {popularStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style)}
                  className={`p-2.5 text-left rounded-2xl border transition-all ${
                    selectedStyleForTryOn?.id === style.id
                      ? 'border-plum-700 bg-plum-50 ring-2 ring-plum-200'
                      : 'border-cream-200 bg-white hover:bg-cream-50 hover:border-plum-200'
                  }`}
                >
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-cream-100 mb-2">
                    <Image
                      src={resolveImageUrl(style.image)}
                      alt={style.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {style.name}
                  </p>
                  <p className="text-sm text-plum-700 font-semibold mt-0.5">
                    £{style.price}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleTryOn}
              disabled={!selectedImage || !selectedStyleForTryOn || isProcessing}
              className="w-full py-3.5 bg-plum-700 text-white font-semibold rounded-2xl transition-all hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-700/25 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing…
                </>
              ) : isComplete ? (
                <>
                  <Check className="w-5 h-5" />
                  Try Another Style
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Try On
                </>
              )}
            </button>

            {isComplete && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-700 text-center font-medium">
                  ✓ Preview complete! See how the style looks on you.
                </p>
              </div>
            )}

            {!selectedImage && (
              <div className="mt-3 p-3 bg-plum-50 rounded-xl border border-plum-100">
                <p className="text-xs text-plum-700 text-center flex items-center justify-center gap-1.5 font-medium">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Upload or take a photo to get started
                </p>
              </div>
            )}

            {selectedImage && !selectedStyleForTryOn && (
              <div className="mt-3 p-3 bg-rose-brand-50 rounded-xl border border-rose-brand-200">
                <p className="text-xs text-rose-brand-700 text-center font-medium">
                  Select a hairstyle above to try on
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}