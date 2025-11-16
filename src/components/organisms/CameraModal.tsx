import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { Button } from '@atoms/Button';
import { X, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void | Promise<void>;
  facingMode?: 'user' | 'environment';
  title?: string;
}

export function CameraModal({
  isOpen,
  onClose,
  onCapture,
  facingMode: initialFacingMode = 'environment',
  title,
}: CameraModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(
    initialFacingMode,
  );
  const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>({
    facingMode: initialFacingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    // No zoom constraints - camera will use default (no zoom)
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentFacingMode(initialFacingMode);
      setVideoConstraints({
        facingMode: initialFacingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // No zoom constraints - camera will use default (no zoom)
      });
    }
  }, [isOpen, initialFacingMode]);

  const flipCamera = (): void => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(newFacingMode);
    setVideoConstraints({
      facingMode: newFacingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      // No zoom constraints - camera will use default (no zoom)
    });
  };

  if (!isOpen) return null;

  const capturePhoto = async (): Promise<void> => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      return;
    }

    try {
      setIsCapturing(true);
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await onCapture(file);
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top overlay with close button */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe flex items-start justify-between pointer-events-none">
        {title && (
          <div className="text-white font-semibold text-lg pointer-events-auto">{title}</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="pointer-events-auto text-white hover:bg-white/20 ml-auto"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera view - full screen, no zoom */}
      <div className="flex-1 relative overflow-hidden w-full h-full">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full"
          style={{
            width: '100%',
            height: '100%',
          }}
          mirrored={currentFacingMode === 'user'}
        />
      </div>

      {/* Bottom controls - like phone camera */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-safe bg-gradient-to-t from-black/60 via-black/40 to-transparent pointer-events-none">
        <div className="px-6 pb-6 pt-12 flex items-center justify-between pointer-events-auto">
          {/* Cancel button - left */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20 px-4 py-2"
          >
            {t('common.cancel')}
          </Button>

          {/* Capture button - center, large circle */}
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className={cn(
              'w-20 h-20 rounded-full border-4 border-white bg-transparent',
              'flex items-center justify-center transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-90',
              'shadow-lg',
            )}
            aria-label={t('inbody.capture')}
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          {/* Flip camera button - right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={flipCamera}
            className="text-white hover:bg-white/20 w-12 h-12"
            aria-label={t('inbody.flipCamera')}
          >
            <RefreshCw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

