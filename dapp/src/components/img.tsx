import React, { useEffect, useState } from 'react';

import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from './ui/skeleton';

interface IImg extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  widht: number;
  height: number;
}

export default function Img({ src, alt, widht, height, className, ...properties }: IImg) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => setIsImageLoaded(true));
  }, [src]);

  if (!isImageLoaded) {
    return <Skeleton className={cn('', className)} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={widht}
      height={height}
      className={cn('', className)}
      {...properties}
    />
  );
}
