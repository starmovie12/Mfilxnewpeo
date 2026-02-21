'use client';

import React from 'react';
import { Movie } from '../types';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';

interface HeroBannerProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onMovieClick }) => {
  const featured = movies.slice(0, 5);

  if (featured.length === 0) return null;

  return (
    <div className="relative w-full pt-20 pb-8">
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4">
        {featured.map((movie, index) => (
          <div 
            key={`${movie.movie_id}-${index}`}
            className="relative flex-shrink-0 w-[92%] aspect-hero rounded-[2rem] overflow-hidden snap-center group cursor-pointer border border-white/5 shadow-2xl transition-transform duration-500 active:scale-[0.98]"
            onClick={() => onMovieClick(movie)}
          >
            {/* Backdrop Image */}
            <Image 
              src={(movie.original_backdrop_url || movie.poster) || 'https://picsum.photos/seed/mflix-hero/1280/720'} 
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              priority
            />
            
            <div className="absolute inset-0 hero-gradient" />
            
            {/* Badges */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <div className="bg-black/40 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <span className="text-[#ffc107] text-xs">★</span>
                <span className="text-white text-[10px] font-black tracking-wide">{movie.rating || '8.4'}</span>
              </div>
              <div className="bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">
                {movie.quality_name || movie.quality || '4K UHD'}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
              <div className="flex flex-wrap gap-2 mb-1">
                {movie.genre?.split(',').slice(0, 2).map(g => (
                  <span key={g} className="text-[8px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">
                    {g.trim()}
                  </span>
                ))}
              </div>

              <h2 className="text-2xl font-black text-white leading-tight tracking-tighter uppercase italic drop-shadow-2xl line-clamp-2">
                {movie.title}
              </h2>
              
              <p className="text-[10px] text-white/60 line-clamp-2 mb-2 font-medium">
                {movie.short_description || movie.description || movie.overview}
              </p>

              <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                <span>{movie.year}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{movie.runtime || '2h 10m'}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{movie.languages?.split(' ')[0] || movie.original_language?.toUpperCase() || 'HINDI'}</span>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button className="flex-1 bg-white text-black h-11 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                  <Play size={16} fill="black" />
                  Watch Now
                </button>
                <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
};
