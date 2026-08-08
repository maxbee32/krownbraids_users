'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, Loader2, Check, RotateCcw, User, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [cameraAttempts, setCameraAttempts] = useState<number>(0);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Check if mobile
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Clean up camera stream on unmount
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
      setCameraAttempts(prev => prev + 1);
      setVideoReady(false);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use a different browser or upload a photo.');
        setIsCameraLoading(false);
        return;
      }

      console.log('Attempting to start camera...');
      console.log('Camera attempt #:', cameraAttempts + 1);
      console.log('videoRef.current exists?', !!videoRef.current);

      // Get the stream
      let stream;
      try {
        console.log('Trying simple constraints...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false 
        });
      } catch (simpleError) {
        console.log('Simple constraints failed, trying with default...');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false 
          });
        } catch (defaultError) {
          throw new Error('Unable to access camera. Please check your camera connection.');
        }
      }

      console.log('Camera stream obtained successfully!');
      
      streamRef.current = stream;
      
      // NOW videoRef.current should exist because video is always rendered
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        
        // Force a load
        await video.load();
        
        // Set up event listeners before playing
        const handleCanPlay = () => {
          console.log('Video can play!');
          setVideoReady(true);
        };
        
        const handlePlaying = () => {
          console.log('Video is playing!');
          setIsCameraActive(true);
          setIsCameraLoading(false);
          setVideoReady(true);
        };
        
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('playing', handlePlaying);
        
        try {
          await video.play();
          console.log('Video play() called successfully');
        } catch (playError) {
          console.error('Video play error:', playError);
          // Try playing again after a short delay
          setTimeout(async () => {
            try {
              await video.play();
              setIsCameraActive(true);
              setIsCameraLoading(false);
              setVideoReady(true);
            } catch (retryError) {
              console.error('Retry play error:', retryError);
              setCameraError('Unable to play video stream. Please try again.');
              setIsCameraLoading(false);
            }
          }, 500);
        }
      } else {
        console.error('videoRef.current is still null!');
        setCameraError('Video element not found. Please refresh and try again.');
        setIsCameraLoading(false);
      }
    } catch (err: any) {
      console.error('Camera error details:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      // Handle specific error types
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please connect a camera or use the upload option.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is busy or not responding. Please close other apps using the camera and try again.');
      } else if (err.message?.includes('secure origin')) {
        setCameraError('Camera requires a secure connection (HTTPS). Please use the upload option.');
      } else {
        setCameraError(`Unable to access camera: ${err.message || 'Unknown error'}. Please use upload instead.`);
      }
      
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
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
    console.log('Camera stopped.');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video dimensions not available yet');
        return;
      }
      
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
        console.log('Photo captured successfully!');
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
      // Reset state before starting
      setIsCameraActive(false);
      setCameraError(null);
      setIsCameraLoading(false);
      setVideoReady(false);
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
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
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
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Camera
              </button>
            </div>

            {!selectedImage ? (
              <div className="relative">
                {/* VIDEO ELEMENT - Always rendered so ref exists! */}
                <div className={`relative rounded-2xl overflow-hidden bg-black ${isCameraActive ? '' : 'hidden'}`}>
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
                    >
                      <Camera className="w-7 h-7 text-gray-800" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-4 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Live
                  </div>
                  {!videoReady && isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Loading Spinner - Shown while camera is starting */}
                {isCameraLoading && !isCameraActive && (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Starting camera...</p>
                    <p className="text-xs text-gray-400 mt-1">Please allow camera access</p>
                    <p className="text-xs text-gray-400 mt-2">Check your browser permissions</p>
                  </div>
                )}

                {/* Error State */}
                {cameraError && !isCameraActive && (
                  <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border-2 border-red-200">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-medium mb-2">{cameraError}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Tips: 
                      <br />• Make sure your camera is connected and not being used by another app
                      <br />• Allow camera access in your browser settings
                      <br />• Try refreshing the page
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={startCamera}
                        className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                      <button
                        onClick={() => handleTabChange('upload')}
                        className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Use Upload Instead
                      </button>
                    </div>
                  </div>
                )}

                {/* Start Camera Button - Only shown when not loading, no error, and not active */}
                {!isCameraLoading && !isCameraActive && !cameraError && (
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
                      <p className="text-xs text-purple-500 mt-2">Click to access your camera</p>
                    </div>
                  </button>
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