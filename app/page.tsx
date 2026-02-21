'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllMovies } from '../services/firebaseService';
import { Movie } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { Search, Bell, User } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      const data = await fetchAllMovies();
      setMovies(data);
      setLoading(false);
    };
    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030812] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin" />
      </div>
    );
  }

  // Smart Filtering Logic
  const featured = movies.filter(m => m.is_featured === 'Yes').length > 0 
    ? movies.filter(m => m.is_featured === 'Yes') 
    : movies.slice(0, 8);

  const trending = movies.filter(m => m.is_trending_now === 'Yes').length > 0
    ? movies.filter(m => m.is_trending_now === 'Yes')
    : movies.slice(0, 12);

  const latest = [...movies]
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 12);

  const bollywood = movies
    .filter(m => m.industry?.toLowerCase().includes('bollywood'))
    .slice(0, 12);

  const action = movies
    .filter(m => m.genre?.toLowerCase().includes('action'))
    .slice(0, 12);

  const comedy = movies
    .filter(m => m.genre?.toLowerCase().includes('comedy'))
    .slice(0, 12);

  const horror = movies
    .filter(m => 
      m.genre?.toLowerCase().includes('horror') || 
      m.genre?.toLowerCase().includes('thriller')
    ).slice(0, 12);

  const romance = movies
    .filter(m => m.genre?.toLowerCase().includes('romance'))
    .slice(0, 12);

  const uhd = movies
    .filter(m => 
      m.quality_name?.includes('4K') || 
      m.quality?.includes('4K')
    ).slice(0, 12);

  return (
    <main className="min-h-screen bg-[#030812] pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-[#E50914] text-2xl font-black tracking-tighter">MFLIX</h1>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <button className="text-white">Home</button>
            <button className="hover:text-white transition-colors">Movies</button>
            <button className="hover:text-white transition-colors">TV Shows</button>
            <button className="hover:text-white transition-colors">My List</button>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Search size={22} className="text-white/80 cursor-pointer" />
          <Bell size={22} className="text-white/80 cursor-pointer" />
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer">
            <User size={18} className="text-white" />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <HeroBanner 
        movies={featured} 
        onMovieClick={(m) => setSelectedMovieId(m.movie_id)} 
      />

      {/* Movie Rows */}
      <div className="space-y-8 -mt-12 relative z-10">
        {trending.length > 0 && (
          <MovieRow title="Trending Now" movies={trending} />
        )}
        {latest.length > 0 && (
          <MovieRow title="Latest Releases" movies={latest} />
        )}
        {uhd.length > 0 && (
          <MovieRow title="4K Ultra HD" movies={uhd} />
        )}
        {bollywood.length > 0 && (
          <MovieRow title="Bollywood Hits" movies={bollywood} />
        )}
        {action.length > 0 && (
          <MovieRow title="Action Packed" movies={action} />
        )}
        {comedy.length > 0 && (
          <MovieRow title="Comedy Central" movies={comedy} />
        )}
        {horror.length > 0 && (
          <MovieRow title="Horror & Thriller" movies={horror} />
        )}
        {romance.length > 0 && (
          <MovieRow title="Romantic Collection" movies={romance} />
        )}
      </div>

      {/* Video Player Overlay */}
      {selectedMovieId && (
        <VideoPlayer 
          movieId={selectedMovieId} 
          onClose={() => setSelectedMovieId(null)} 
        />
      )}
    </main>
  );
}
