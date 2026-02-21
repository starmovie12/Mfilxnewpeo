
export interface Movie {
  movie_id: string;
  title: string;
  original_title?: string;
  poster: string;
  original_poster_url?: string;
  original_backdrop_url?: string;
  rating: string | number;
  quality_name?: string;
  quality?: string;
  year: string | number;
  original_language?: string;
  category?: string;
  adult_content?: string | boolean;
  cast?: string;
  cast_crew_data?: string;
  director?: string;
  writer?: string;
  producer?: string;
  genre?: string;
  industry?: string;
  keywords?: string;
  platform?: string;
  production_companies?: string;
  production_countries?: string;
  spoken_languages?: string;
  languages?: string;
  audio_type?: string;
  description?: string;
  short_description?: string;
  overview?: string;
  video_url?: string;
  trailer_url?: string;
  download_links?: DownloadLink[] | string;
  qualities?: any;
  content_type?: string;
  type?: string;
  seasons?: Season[];
  release_year?: string | number;
  full_movie_release_date?: string;
  last_updated_date?: string;
  runtime?: string | number;
  certification?: string;
  certification_status?: string;
  imdb_id?: string;
  status?: string;
  tagline?: string;
  collection_name?: string;
  country?: string;
  is_featured?: string;
  is_trending_now?: string;
  download_count?: string;
  view_count?: string;
  vote_count?: string | number;
  age_rating?: string;
}

export interface DownloadLink {
  link?: string;      // Firebase uses "link" for URL
  name?: string;      // Firebase uses "name" for quality label
  url?: string;       // Alternative URL field
  movie_link?: string;
  quality?: string;
  label?: string;
  size?: string;
  info?: string;
}

export interface Season {
  name?: string;
  episodes?: Episode[];
}

export interface Episode {
  title?: string;
  url?: string;
  link?: string;
}

export enum TabCategory {
  HOME = 'home',
  MOVIES = 'movies',
  SERIES = 'tvshow',
  ANIME = 'anime',
  ADULT = 'adult'
}

export interface TabInfo {
  id: TabCategory;
  label: string;
}
