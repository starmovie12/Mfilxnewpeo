'use client';

import React from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { useRouter } from 'next/navigation';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  variant?: 'portrait' | 'landscape';
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, variant = 'portrait' }) => {
  const router = useRouter();

  if (movies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="px-6 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white/50 italic">
          {title}
        </h2>
        <button className="text-[10px] font-black text-[#E50914] uppercase tracking-widest hover:underline">
          View All
        </button>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar px-6 gap-3 pb-4">
        {movies.map((movie, index) => (
          <MovieCard 
            key={`${movie.movie_id}-${index}`} 
            movie={movie} 
            variant={variant}
            onClick={() => router.push(`/player/${movie.movie_id}`)}
          />
        ))}
        {/* Spacer for end of scroll */}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
};
