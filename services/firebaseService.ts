
import { Movie } from '../types';

// Using the configuration provided in the original HTML
const firebaseConfig = {
    apiKey: "AIzaSyAFj5jrF26JDJdcteQzdojXcUypvm3UaKc", 
    authDomain: "bhaag-df531.firebaseapp.com",        
    databaseURL: "https://bhaag-df531-default-rtdb.firebaseio.com", 
    projectId: "bhaag-df531",                         
    storageBucket: "bhaag-df531.firebasestorage.app",
    appId: "1:421542632463:web:xxxxxxxxxxxxxx" 
};

/**
 * Since standard Firebase v8/v9 imports might conflict with the sandbox,
 * we use a simplified fetch-based approach for the Realtime Database REST API.
 * This is faster and more reliable in this specific environment.
 */

const BASE_URL = firebaseConfig.databaseURL;

// Mock data for fallback when Firebase fails
const MOCK_MOVIES: Record<string, Movie> = {
  "sample-1": {
    movie_id: "sample-1",
    title: "Sample Movie",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality_name: "720P HD",
    poster: "https://picsum.photos/seed/movie1/800/450",
    rating: "8.5",
    year: "2024"
  }
};

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
    if (!data) return Object.values(MOCK_MOVIES);
    
    return Object.values(data) as Movie[];
  } catch (error) {
    console.error("Firebase fetch error:", error);
    // Return mock data as fallback
    return Object.values(MOCK_MOVIES);
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
    if (!data) return MOCK_MOVIES[id] || MOCK_MOVIES["sample-1"];
    return data as Movie;
  } catch (error) {
    console.error("Firebase fetch by id error:", error);
    // Return mock data as fallback
    return MOCK_MOVIES[id] || MOCK_MOVIES["sample-1"];
  }
};
