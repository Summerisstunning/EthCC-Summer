'use client';

interface BackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
}

export default function BackgroundImage({ src, alt, className = '', children }: BackgroundImageProps) {
  return (
    <div 
      className={`min-h-screen bg-cover bg-center bg-no-repeat relative ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.8), rgba(248, 250, 252, 0.8)), url('${src}')`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 to-purple-50/80" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}