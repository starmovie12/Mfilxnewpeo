
import { Movie } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL 
  || "https://bhaag-df531-default-rtdb.firebaseio.com";

// Mock data for fallback when Firebase fails
const MOCK_MOVIES: Movie[] = [
  {
    movie_id: "sample-1",
    title: "Big Buck Bunny",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality_name: "1080P FHD",
    poster: "https://picsum.photos/seed/bunny/800/450",
    rating: "8.5",
    year: "2024",
    genre: "Animation",
    is_featured: "Yes"
  },
  {
    movie_id: "sample-2",
    title: "Elephant's Dream",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    quality_name: "1080P FHD",
    poster: "https://picsum.photos/seed/elephant/800/450",
    rating: "7.9",
    year: "2024",
    genre: "Animation",
    is_trending_now: "Yes"
  },
  {
    movie_id: "sample-3",
    title: "For Bigger Blazes",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    quality_name: "1080P FHD",
    poster: "https://picsum.photos/seed/blazes/800/450",
    rating: "8.2",
    year: "2024",
    genre: "Action",
    is_featured: "Yes"
  },
  {
    movie_id: "sample-4",
    title: "Subaru Outback",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    quality_name: "1080P FHD",
    poster: "https://picsum.photos/seed/subaru/800/450",
    rating: "7.5",
    year: "2024",
    genre: "Adventure",
    is_trending_now: "Yes"
  }
];

export const fetchAllMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${BASE_URL}/movies_by_id.json`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data = await response.json();
    if (!data) return MOCK_MOVIES;
    
    return Object.values(data) as Movie[];
  } catch (error: any) {
    console.error("Firebase fetch error:", error?.message || error);
    return MOCK_MOVIES;
  }
};

export const fetchMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movies_by_id/${id}.json`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch movie');
    const data = await response.json();
    if (!data) return MOCK_MOVIES.find(m => m.movie_id === id) || MOCK_MOVIES[0];
    return data as Movie;
  } catch (error: any) {
    console.error("Firebase fetch by id error:", error?.message || error);
    return MOCK_MOVIES.find(m => m.movie_id === id) || MOCK_MOVIES[0];
  }
};
