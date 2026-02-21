'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie } from '../../../types';
import { fetchMovieById, fetchAllMovies } from '../../../services/firebaseService';
import { ArrowLeft, Settings, Maximize, Play, Download, Plus, ThumbsUp, Share2, Flag, X, PlayCircle, Layers } from 'lucide-react';

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeries, setIsSeries] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hardcoded URL from previous instruction
  const HARDCODED_URL = "https://pub-34413a7eec4f40c883aa01fe9d524f5c.r2.dev/72a23d715781d48564f8d8da4914461e?token=1771607272";

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      const data = await fetchMovieById(id as string);
      if (data) {
        const normalized = normalizeData(data);
        setMovie(normalized);
        setIsSeries(normalized.isSeries);
        
        // As per previous instruction: "always load this exact url... and ignore other dynamic links"
        setActiveVideoUrl(HARDCODED_URL);
      }
      
      const all = await fetchAllMovies();
      setRelatedMovies(all.slice(0, 12));
      setLoading(false);
    };

    loadData();
  }, [id]);

  const normalizeData = (data: any) => {
    const isSeries = (data.content_type === 'series' || data.type === 'series' || (data.seasons && data.seasons.length > 0));
    const title = data.title || data.original_title || "Untitled";
    const qualityName = data.quality_name || "HD";
    const year = (data.release_year || "2024").toString();
    const genre = Array.isArray(data.genre) ? data.genre.join(', ') : (data.genre || "Drama");
    const runtime = data.runtime ? data.runtime + "m" : "N/A";
    
    let links: any[] = [];
    if(!isSeries) {
        let rawLinks = data.download_links || data.qualities;
        if(typeof rawLinks === 'string') {
            try { rawLinks = JSON.parse(rawLinks); } catch(e){ rawLinks = []; }
        }
        if(rawLinks) {
            const arr = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks);
            arr.forEach((item: any) => {
                if(item.url || item.link || item.movie_link) {
                    links.push({
                        url: item.url || item.link || item.movie_link,
                        label: item.quality || 'HD',
                        info: item.size || ''
                    });
                }
            });
        }
    }

    return {
        ...data,
        isSeries,
        title, qualityName, year, genre, runtime,
        cert: data.certification || "UA",
        rating: data.rating || "0.0",
        plot: data.description || data.overview || "No synopsis available.",
        links,
        seasons: data.seasons || []
    };
  };

  const playVideo = (url: string) => {
    // Even if we pass a URL, we stick to the hardcoded one as per user's "ignore dynamic links" rule
    setActiveVideoUrl(HARDCODED_URL);
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
      <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col">
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
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <style jsx global>{`
        :root {
          --primary-red: #E50914;
          --bg-black: #0f0f0f;
          --bg-card: #1a1a1a;
          --text-main: #ffffff;
          --text-sec: #a3a3a3;
          --accent-gold: #ffc107;
          --meta-bg: rgba(255, 255, 255, 0.1);
          --divider-color: rgba(255, 255, 255, 0.15);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Player Section */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0 z-50">
        <video 
          ref={videoRef}
          src={activeVideoUrl}
          controls 
          autoPlay 
          playsInline 
          className="w-full h-full object-contain"
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
      <div className="flex-grow overflow-y-auto no-scrollbar pb-20">
        <div className="p-4">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h1 className="text-2xl font-extrabold leading-tight">{movie.title}</h1>
            <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">{movie.qualityName}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 mb-6">
            <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs font-medium border border-white/5">{movie.cert}</div>
            <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs font-medium border border-white/5 flex items-center gap-1.5">
              <Play size={10} fill="#ffc107" className="text-[#ffc107]" /> {movie.rating}
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs font-medium border border-white/5">{movie.year}</div>
            <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs font-medium border border-white/5">{movie.genre}</div>
            <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs font-medium border border-white/5">{movie.runtime}</div>
          </div>

          <div className="h-[1px] w-full bg-white/15 mb-4" />

          {/* Action Buttons */}
          <div className={`grid gap-3 mb-4 ${isSeries ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'}`}>
            {!isSeries ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowPlayMenu(!showPlayMenu)}
                    className="w-full h-12 bg-[#E50914] rounded-md flex items-center justify-center gap-2 font-bold text-base active:scale-95 transition-transform"
                  >
                    <Play size={18} fill="white" /> Play Movie
                  </button>
                  {showPlayMenu && (
                    <div className="absolute top-14 left-0 w-full bg-[#141414]/95 border border-white/10 rounded-lg flex flex-col z-[100] overflow-hidden">
                      {movie.links.map((link: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => { playVideo(link.url); setShowPlayMenu(false); }}
                          className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          Play {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="w-12 h-12 bg-[#333] rounded-md flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Download size={20} />
                  </button>
                  {showDownloadMenu && (
                    <div className="absolute top-14 right-0 min-w-[160px] bg-[#141414]/95 border border-white/10 rounded-lg flex flex-col z-[100] overflow-hidden">
                      {movie.links.map((link: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => { window.open(link.url, '_blank'); setShowDownloadMenu(false); }}
                          className="px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          {link.label} {link.info}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setShowEpisodes(true)}
                className="w-full h-12 bg-[#2962FF] rounded-md flex items-center justify-center gap-2 font-bold text-base active:scale-95 transition-transform"
              >
                <Layers size={18} /> View Episodes
              </button>
            )}
          </div>

          {/* Social Row */}
          <div className="flex justify-around py-2 mb-4">
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-medium">
              <Plus size={22} className="text-white" /> My List
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-medium">
              <ThumbsUp size={22} className="text-white" /> Like
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-medium">
              <Share2 size={22} className="text-white" /> Share
            </button>
            <button className="flex flex-col items-center gap-1.5 text-[10px] text-white/60 font-medium">
              <Flag size={22} className="text-white" /> Report
            </button>
          </div>

          <div className="h-[1px] w-full bg-white/15 mb-4" />
          
          <p className="text-sm leading-relaxed text-white/80 mb-8">{movie.plot}</p>

          <h3 className="text-lg font-bold mb-4">More Like This</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {relatedMovies.map((m) => (
              <div 
                key={m.movie_id} 
                className="flex flex-col gap-1.5 cursor-pointer"
                onClick={() => router.push(`/player/${m.movie_id}`)}
              >
                <img src={m.poster} alt={m.title} className="w-full aspect-[2/3] object-cover rounded-md" />
                <p className="text-[10px] font-medium text-white/70 truncate">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Episodes Overlay */}
      {showEpisodes && (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#111]">
            <h3 className="text-lg font-bold">Episodes</h3>
            <button onClick={() => setShowEpisodes(false)} className="text-white">
              <X size={28} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {movie.seasons.length === 0 ? (
              <p className="text-center text-white/40 mt-10">No episodes found.</p>
            ) : (
              movie.seasons.map((season: any, sIndex: number) => (
                <div key={sIndex} className="space-y-3">
                  <h4 className="text-[#ffc107] font-bold text-base">{season.name || `Season ${sIndex + 1}`}</h4>
                  <div className="space-y-2.5">
                    {season.episodes?.map((ep: any, eIndex: number) => (
                      <div 
                        key={eIndex}
                        onClick={() => { playVideo(ep.url || ep.link); setShowEpisodes(false); }}
                        className="flex items-center gap-4 bg-[#222] p-3 rounded-lg border border-white/5 hover:bg-[#333] transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-bold text-white/40 w-6">{eIndex + 1}</span>
                        <span className="flex-grow text-sm font-medium">{ep.title || `Episode ${eIndex + 1}`}</span>
                        <PlayCircle size={20} className="text-[#E50914]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
