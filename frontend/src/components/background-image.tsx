'use client';

interface BackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
  overlayIntensity?: 'light' | 'medium' | 'heavy';
}

export default function BackgroundImage({ 
  src, 
  alt, 
  className = '', 
  children, 
  overlayIntensity = 'medium' 
}: BackgroundImageProps) {
  
  // 根据不同强度设置遮罩
  const getOverlayStyle = () => {
    switch (overlayIntensity) {
      case 'light':
        return 'from-white/60 via-white/40 to-white/60';
      case 'heavy':
        return 'from-white/90 via-white/70 to-white/90';
      default:
        return 'from-white/75 via-white/50 to-white/75';
    }
  };

  return (
    <div 
      className={`min-h-screen bg-cover bg-center bg-no-repeat relative ${className}`}
      style={{
        backgroundImage: `url('${src}')`,
        backgroundAttachment: 'fixed', // 视差效果
      }}
    >
      {/* 主要遮罩层 - 确保文字可读性 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getOverlayStyle()}`} />
      
      {/* 额外的色彩遮罩 - 保持品牌色调 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-purple-50/30" />
      
      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 图片信息标签 - 可选 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
          <p className="text-white/80 text-xs">{alt}</p>
        </div>
      </div>
    </div>
  );
}