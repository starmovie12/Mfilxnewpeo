'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie, DownloadLink } from '../../../types';
import { fetchMovieById, fetchAllMovies } from '../../../services/firebaseService';
import { ArrowLeft, Settings, Maximize, Play, Download, Plus, ThumbsUp, Share2, Flag, X, PlayCircle, Layers, ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import Image from 'next/image';

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      const data = await fetchMovieById(id as string);
      if (data) {
        const normalized = normalizeData(data);
        setMovie(normalized);
        setActiveVideoUrl(normalized.video_url || FALLBACK_VIDEO);
      }
      
      const all = await fetchAllMovies();
      setRelatedMovies(all.filter(m => m.movie_id !== id).slice(0, 12));
      setLoading(false);
    };

    loadData();
  }, [id]);

  const normalizeData = (data: Movie) => {
    const isSeries = (data.content_type === 'series' || data.type === 'series' || (data.seasons && data.seasons.length > 0));
    const title = data.title || "Untitled";
    const qualityName = data.quality_name || data.quality || "HD";
    const year = (data.year || data.release_year || "2024").toString();
    const genre = data.genre || "Drama";
    const runtime = data.runtime ? data.runtime.toString() : "N/A";
    const language = data.languages || data.original_language?.toUpperCase() || "Hindi";
    
    let links: any[] = [];
    if(!isSeries) {
        let rawLinks = data.download_links || data.qualities;
        if(typeof rawLinks === 'string') {
            try { rawLinks = JSON.parse(rawLinks); } catch(e){ rawLinks = []; }
        }
        if(rawLinks) {
            const arr = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks);
            arr.forEach((item: any) => {
                const url = item.link || item.url || item.movie_link;
                if(url) {
                    const nameRaw = item.name || item.quality || item.label || 'HD';
                    const sizeMatch = nameRaw.match(/\[([^\]]+)\]/);
                    const cleanLabel = nameRaw.replace(/\s*\[[^\]]+\]/, '').trim();
                    links.push({
                        url,
                        label: cleanLabel || 'HD',
                        info: sizeMatch ? sizeMatch[1] : (item.size || '')
                    });
                }
            });
        }
    }

    // Parse cast_crew_data
    let castList: any[] = [];
    if (data.cast_crew_data) {
        try {
            const parsed = JSON.parse(data.cast_crew_data);
            castList = parsed.cast?.slice(0, 6) || [];
        } catch (e: any) {
            console.error("Error parsing cast data", e?.message || e);
        }
    }

    return {
        ...data,
        isSeries,
        title, qualityName, year, genre, runtime, language,
        cert: data.certification_status || data.certification || "UA",
        rating: data.rating || "0.0",
        plot: data.short_description || data.description || data.overview || "No synopsis available.",
        links,
        seasons: data.seasons || [],
        castList
    };
  };

  const playVideo = (url: string) => {
    const videoUrl = url || FALLBACK_VIDEO;
    setActiveVideoUrl(videoUrl);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => console.log("Autoplay prevented"));
    }
  };

  const toggleFit = () => {
    if (videoRef.current) {
      videoRef.current.style.objectFit = videoRef.current.style.objectFit === 'cover' ? 'contain' : 'cover';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#030812] flex flex-col">
        <div className="aspect-video bg-black w-full" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
          <div className="h-12 w-full bg-white/5 animate-pulse rounded" />
          <div className="h-24 w-full bg-white/5 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#030812] text-white overflow-x-hidden">
      {/* Player Section */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0 z-50">
        <video 
          ref={videoRef}
          src={activeVideoUrl}
          controls 
          autoPlay 
          playsInline 
          className="w-full h-full object-contain"
          onError={() => setActiveVideoUrl(FALLBACK_VIDEO)}
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button 
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/25 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3 pointer-events-auto">
            <div className="relative">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <Settings size={18} />
              </button>
              {showQualityMenu && (
                <div className="absolute top-11 right-0 bg-[#141414]/95 border border-white/10 rounded-lg min-w-[140px] flex flex-col z-[100] overflow-hidden">
                  {['1080p', '720p', '480p'].map(q => (
                    <button key={q} className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0 uppercase font-bold tracking-wider">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={toggleFit}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow pb-20">
        <div className="p-4">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h1 className="text-2xl font-black leading-tight tracking-tight">{movie.title}</h1>
            <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">{movie.qualityName}</span>
          </div>
          
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="text-white/60 text-sm mb-1">{movie.original_title}</p>
          )}

          {movie.tagline && (
            <p className="text-white/40 text-xs italic mb-4">"{movie.tagline}"</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mb-4">
            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{movie.cert}</div>
            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/5 flex items-center gap-1">
              <span className="text-[#ffc107]">★</span> {movie.rating}
            </div>
            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{movie.year}</div>
            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{movie.runtime}</div>
            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{movie.language}</div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.split(',').map((g: string) => (
              <span key={g} className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                {g.trim()}
              </span>
            ))}
          </div>

          <div className="h-[1px] w-full bg-white/10 mb-6" />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="relative">
              <button 
                onClick={() => setShowPlayMenu(!showPlayMenu)}
                className="w-full h-12 bg-[#E50914] rounded-md flex items-center justify-center gap-2 font-black text-base active:scale-95 transition-transform uppercase tracking-wider"
              >
                <Play size={20} fill="white" /> Play Movie
              </button>
              {showPlayMenu && (
                <div className="absolute top-14 left-0 w-full bg-[#141414]/95 border border-white/10 rounded-lg flex flex-col z-[100] overflow-hidden shadow-2xl">
                  {movie.links.length > 0 ? movie.links.map((link: any, i: number) => (
                    <button 
                      key={i}
                      onClick={() => { playVideo(link.url); setShowPlayMenu(false); }}
                      className="px-4 py-4 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between"
                    >
                      <span className="font-bold">▶ Play {link.label}</span>
                      {link.info && <span className="text-white/40 text-xs">({link.info})</span>}
                    </button>
                  )) : (
                    <button 
                      onClick={() => { playVideo(FALLBACK_VIDEO); setShowPlayMenu(false); }}
                      className="px-4 py-4 text-left text-sm hover:bg-white/5 font-bold"
                    >
                      ▶ Play Default (HD)
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="w-full h-12 bg-white/10 border border-white/10 rounded-md flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform uppercase tracking-wider"
                >
                  <Download size={18} /> Download
                </button>
                {showDownloadMenu && (
                  <div className="absolute top-14 left-0 w-full bg-[#141414]/95 border border-white/10 rounded-lg flex flex-col z-[100] overflow-hidden shadow-2xl">
                    {movie.links.length > 0 ? movie.links.map((link: any, i: number) => (
                      <button 
                        key={i}
                        onClick={() => { window.open(link.url, '_blank'); setShowDownloadMenu(false); }}
                        className="px-4 py-4 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between"
                      >
                        <span className="font-bold">⬇ {link.label}</span>
                        {link.info && <span className="text-white/40 text-xs">({link.info})</span>}
                      </button>
                    )) : (
                        <p className="p-4 text-center text-white/40 text-xs">No download links available</p>
                    )}
                  </div>
                )}
              </div>

              {movie.trailer_url && (
                <button 
                  onClick={() => window.open(movie.trailer_url, '_blank')}
                  className="flex-1 h-12 bg-white/10 border border-white/10 rounded-md flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform uppercase tracking-wider"
                >
                  <Youtube size={18} /> Trailer
                </button>
              )}
            </div>
          </div>

          {/* Social Row */}
          <div className="flex justify-around py-2 mb-6">
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-bold uppercase tracking-widest">
              <Plus size={24} className="text-white" /> My List
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-bold uppercase tracking-widest">
              <ThumbsUp size={24} className="text-white" /> Like
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-bold uppercase tracking-widest">
              <Share2 size={24} className="text-white" /> Share
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-bold uppercase tracking-widest">
              <Flag size={24} className="text-white" /> Report
            </button>
          </div>

          <div className="h-[1px] w-full bg-white/10 mb-6" />
          
          {/* Description */}
          <div className="mb-8">
            <p className={`text-sm leading-relaxed text-white/70 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
              {movie.plot}
            </p>
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-[#E50914] text-xs font-black uppercase tracking-widest flex items-center gap-1"
            >
              {isDescriptionExpanded ? (
                <>Less <ChevronUp size={14} /></>
              ) : (
                <>More <ChevronDown size={14} /></>
              )}
            </button>
          </div>

          {/* Details Card */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Director</p>
                <p className="font-medium">{movie.director || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Writer</p>
                <p className="font-medium">{movie.writer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Producer</p>
                <p className="font-medium">{movie.producer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Industry</p>
                <p className="font-medium">{movie.industry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Country</p>
                <p className="font-medium">{movie.country || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Platform</p>
                <p className="font-medium">{movie.platform || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">Status</p>
                <p className="font-medium">{movie.status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1">IMDB ID</p>
                <p className="font-medium">{movie.imdb_id || 'N/A'}</p>
              </div>
            </div>
            {movie.collection_name && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-white/40 font-bold uppercase tracking-widest mb-1 text-[10px]">Collection</p>
                <p className="text-xs font-medium">{movie.collection_name}</p>
              </div>
            )}
          </div>

          {/* Cast Section */}
          {movie.castList.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-white/50">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {movie.castList.map((person: any, index: number) => (
                  <div key={`${person.id}-${index}`} className="flex-shrink-0 w-20 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-white/5 shadow-xl">
                      <Image 
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name || 'Cast')}`}
                        alt={person.name || 'Cast Member'}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] font-bold leading-tight line-clamp-2">{person.name || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Movies */}
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-white/50">More Like This</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {relatedMovies.map((m, index) => (
              <div 
                key={`${m.movie_id}-${index}`} 
                className="flex flex-col gap-1.5 cursor-pointer group"
                onClick={() => router.push(`/player/${m.movie_id}`)}
              >
                <div className="relative aspect-[2/3] rounded-md overflow-hidden border border-white/5">
                  <Image 
                    src={m.poster || 'https://picsum.photos/seed/mflix-related/200/300'} 
                    alt={m.title} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] font-bold text-white/50 truncate group-hover:text-white transition-colors">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
