import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  quality?: number | string;
  sizes?: string;
  unoptimized?: boolean;
  width?: number | string;
  height?: number | string;
}

export default function Image({
  src,
  alt = '',
  fill,
  priority,
  className = '',
  sizes,
  unoptimized,
  width,
  height,
  style,
  ...rest
}: ImageProps) {
  const combinedClassName = fill
    ? `absolute inset-0 w-full h-full ${className}`
    : className;

  return (
    <img
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={combinedClassName}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      sizes={sizes}
      style={{
        ...(fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0 } : {}),
        ...style,
      }}
      {...rest}
    />
  );
}
