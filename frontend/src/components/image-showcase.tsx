'use client';

import { useState } from 'react';

interface ImageInfo {
  src: string;
  alt: string;
  title: string;
  description: string;
  page: string;
}

const imageGallery: ImageInfo[] = [
  {
    src: '/images/hero-bg.png',
    alt: 'Bali Paradise',
    title: 'Bali Dreams',
    description: 'Your ultimate destination - Where love and gratitude meet paradise',
    page: 'Homepage'
  },
  {
    src: '/images/gratitude-bg.png',
    alt: 'Bali Beauty',
    title: 'Gratitude Garden',
    description: 'Express your daily appreciation in this serene tropical setting',
    page: 'Gratitude Page'
  },
  {
    src: '/images/wallet-bg.png',
    alt: 'Beijing Memories',
    title: 'Growing Together',
    description: 'Building your shared future, one contribution at a time',
    page: 'Wallet Page'
  },
  {
    src: '/images/dashboard-bg.png',
    alt: 'Cannes Elegance',
    title: 'Celebrating Success',
    description: 'Track your journey and celebrate every milestone achieved',
    page: 'Dashboard'
  }
];

export default function ImageShowcase() {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);

  return (
    <>
      {/* Image Gallery */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🖼️ Beautiful Backgrounds</h3>
          <div className="grid grid-cols-2 gap-2">
            {imageGallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="relative group overflow-hidden rounded-lg aspect-video hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200" />
                <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
                  {image.title}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Click to preview any background
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] m-4">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedImage.title}
              </h2>
              <p className="text-white/90 mb-1">
                {selectedImage.description}
              </p>
              <p className="text-white/70 text-sm">
                Used in: {selectedImage.page}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}