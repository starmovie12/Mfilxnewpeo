'use client';

import React from 'react';
import { Movie } from '../types';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  variant?: 'portrait' | 'landscape';
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, variant = 'portrait' }) => {
  const isLandscape = variant === 'landscape';

  return (
    <div 
      className={`relative flex-shrink-0 group cursor-pointer transition-all duration-500 active:scale-95 ${
        isLandscape ? 'w-64 aspect-video' : 'w-32 md:w-40 aspect-[2/3]'
      }`}
      onClick={() => onClick(movie)}
    >
      <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/5 bg-[#1a1a1a] shadow-xl">
        <Image 
          src={(isLandscape ? (movie.original_backdrop_url || movie.poster) : movie.poster) || 'https://picsum.photos/seed/mflix/400/600'} 
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center shadow-lg">
              <Play size={14} fill="white" className="ml-0.5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#ffc107]">
              <Star size={10} fill="#ffc107" /> {movie.rating}
            </div>
          </div>
          <h3 className="text-white text-[10px] font-black uppercase tracking-tight line-clamp-1 italic">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] font-bold text-white/60">{movie.year}</span>
            <span className="text-[8px] font-black text-[#E50914] uppercase">{movie.quality_name || movie.quality || 'HD'}</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Title (Visible when not hovered) */}
      <div className="mt-2 group-hover:opacity-0 transition-opacity duration-300">
        <p className="text-[10px] font-bold text-white/60 truncate uppercase tracking-tight">{movie.title}</p>
      </div>
    </div>
  );
};
