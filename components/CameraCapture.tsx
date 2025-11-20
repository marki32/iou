import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1]; 
        onCapture(base64);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col sm:items-center sm:justify-center">
      <button 
        onClick={onClose} 
        className="absolute top-8 right-6 z-50 p-3 bg-black/20 text-white rounded-full hover:bg-black/40 backdrop-blur-md transition-all"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      {error ? (
        <div className="text-white p-6 text-center">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full font-medium">
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="w-full h-full sm:h-auto sm:w-full sm:max-w-md sm:aspect-[3/4] relative bg-black sm:rounded-2xl overflow-hidden sm:shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50">
            <button 
              onClick={takePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-yellow-400 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full opacity-80"></div>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default CameraCapture;