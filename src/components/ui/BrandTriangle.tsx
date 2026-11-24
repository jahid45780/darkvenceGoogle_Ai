import React from 'react';

interface BrandTriangleProps {
  className?: string;
  size?: number;
  inverted?: boolean;
  color?: string;
  stroke?: boolean;
}

export const BrandTriangle: React.FC<BrandTriangleProps> = ({
  className = '',
  size = 16,
  inverted = false,
  color = '#B6FF2B',
  stroke = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 transition-transform ${inverted ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10.268 3.86c.77-1.333 2.694-1.333 3.464 0l8.038 13.923c.77 1.333-.192 3-1.732 3H3.962c-1.54 0-2.502-1.667-1.732-3L10.268 3.86z"
        fill={stroke ? 'none' : color}
        stroke={stroke ? color : undefined}
        strokeWidth={stroke ? 2 : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
};
