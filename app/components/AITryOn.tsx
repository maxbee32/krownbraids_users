'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, Loader2, Check, RotateCcw, User, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Style } from '../types';

interface AITryOnProps {
  selectedStyle?: Style;
  onClose?: () => void;
  onStyleSelect?: (style: Style) => void;
}

export default function AITryOn({ selectedStyle, onClose, onStyleSelect }: AITryOnProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [selectedStyleForTryOn, setSelectedStyleForTryOn] = useState<Style | undefined>(selectedStyle);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Popular styles for quick selection
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
      image: '/assets/img/style-21.jpg',
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
      image: '/assets/img/style-20.jpg',
      popularity: 90,
    },
  ];

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImage(photoData);
        setIsComplete(false);
        stopCamera();
      }
    }
  };

  const handleTryOn = () => {
    if (!selectedImage || !selectedStyleForTryOn) return;
    setIsProcessing(true);
    
    // Simulate AI processing
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
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
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
      startCamera();
    } else {
      stopCamera();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">AI Try-On</h2>
            <p className="text-xs text-gray-500">Upload or take a photo to try styles</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Upload & Preview */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Photo</h3>
              <p className="text-xs text-gray-500">Upload or take a photo for the best results</p>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleTabChange('upload')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={() => handleTabChange('camera')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Camera
              </button>
            </div>

            {!selectedImage ? (
              // Upload/Camera Area
              <div>
                {activeTab === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP (Max 5MB)</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    {cameraError ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-red-200">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-red-600 font-medium">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : isCameraActive ? (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          className="w-full rounded-2xl bg-black aspect-[3/4] object-cover"
                          playsInline
                          autoPlay
                          muted
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                          <button
                            onClick={capturePhoto}
                            className="px-6 py-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <Camera className="w-6 h-6 text-gray-800" />
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-6 py-3 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform text-white"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="w-full py-16 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 transition-colors bg-gray-50 hover:bg-gray-100/50 flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Start Camera</p>
                          <p className="text-xs text-gray-400 mt-1">Take a selfie</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Image Preview
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={selectedImage}
                    alt="Your photo"
                    fill
                    className="object-cover"
                  />
                  {isComplete && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  )}
                </div>
                
                {/* Actions on image */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
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

          {/* Right - Style Selection & Results */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Select a Style</h3>
              <p className="text-xs text-gray-500">Choose a hairstyle to try on</p>
            </div>

            {/* Selected Style */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              {selectedStyleForTryOn ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-100 flex-shrink-0">
                    <Image
                      src={selectedStyleForTryOn.image}
                      alt={selectedStyleForTryOn.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedStyleForTryOn.name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedStyleForTryOn.category}</p>
                    <p className="text-sm font-bold text-amber-600">£{selectedStyleForTryOn.price}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStyleForTryOn(undefined)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No style selected</p>
                  <p className="text-xs text-gray-400 mt-1">Choose from popular styles below</p>
                </div>
              )}
            </div>

            {/* Quick Style Selection */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-4 pr-1">
              {popularStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style)}
                  className={`p-2 text-left rounded-xl border transition-all hover:border-purple-300 ${
                    selectedStyleForTryOn?.id === style.id
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-full h-14 rounded-lg overflow-hidden bg-amber-100 mb-1.5">
                    <Image
                      src={style.image}
                      alt={style.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">{style.name}</p>
                  <p className="text-xs text-amber-600 font-semibold">£{style.price}</p>
                </button>
              ))}
            </div>

            {/* Try-On Button */}
            <button
              onClick={handleTryOn}
              disabled={!selectedImage || !selectedStyleForTryOn || isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing AI...
                </>
              ) : isComplete ? (
                <>
                  <Check className="w-5 h-5" />
                  Try Another Style
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Try On with AI
                </>
              )}
            </button>

            {isComplete && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-700 text-center">
                  ✓ AI preview complete! See how the style looks on you.
                </p>
              </div>
            )}

            {!selectedImage && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700 text-center flex items-center justify-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Upload or take a photo to get started
                </p>
              </div>
            )}

            {selectedImage && !selectedStyleForTryOn && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 text-center">
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