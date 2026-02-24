import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

type ImageWithPlaceholderProps = {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  placeholderText?: string;
};

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  placeholderClassName = '',
  placeholderText = 'Görsel mevcut değil',
}) => {
  const [hasError, setHasError] = useState(false);
  const shouldShowPlaceholder = !src || hasError;

  if (shouldShowPlaceholder) {
    return (
      <div className={`w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400 ${placeholderClassName}`}>
        <ImageOff size={20} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-center px-3">
          {placeholderText}
        </span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
};

export default ImageWithPlaceholder;
