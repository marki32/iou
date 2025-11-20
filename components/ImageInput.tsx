import React, { useRef } from 'react';
import { UploadIcon, CameraIcon } from './Icons';

interface ImageInputProps {
  onImageSelected: (base64: string) => void;
  onCameraRequest: () => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, onCameraRequest }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64
        const base64 = result.split(',')[1];
        onImageSelected(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-2xl mx-auto mt-6 md:mt-8">
      
      {/* Upload Card */}
      <div 
        onClick={triggerFileSelect}
        className="flex-1 group cursor-pointer"
      >
        <div className="h-48 sm:h-64 bg-white rounded-3xl border-2 border-transparent hover:border-yellow-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
            <UploadIcon className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
          </div>
          <h3 className="relative z-10 text-base md:text-lg font-semibold text-stone-800">Upload Image</h3>
          <p className="relative z-10 text-xs md:text-sm text-stone-500 mt-1 md:mt-2 text-center">Drag & drop or click to browse</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Camera Card */}
      <div 
        onClick={onCameraRequest}
        className="flex-1 group cursor-pointer"
      >
        <div className="h-48 sm:h-64 bg-stone-900 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-stone-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-stone-800 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 border border-stone-700">
            <CameraIcon className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          </div>
          <h3 className="relative z-10 text-base md:text-lg font-semibold text-white">Snap Photo</h3>
          <p className="relative z-10 text-xs md:text-sm text-stone-400 mt-1 md:mt-2 text-center">Use your camera to capture</p>
        </div>
      </div>

    </div>
  );
};

export default ImageInput;