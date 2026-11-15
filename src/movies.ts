import elOrigenDelLenguaje600 from './assets/posters/el-origen-del-lenguaje-600.webp';
import elOrigenDelLenguaje1200 from './assets/posters/el-origen-del-lenguaje-1200.webp';
import elReyBrujo600 from './assets/posters/el-rey-brujo-600.webp';
import elReyBrujo1200 from './assets/posters/el-rey-brujo-1200.webp';
import seEstaHaciendoTarde600 from './assets/posters/se-esta-haciendo-tarde-600.webp';
import seEstaHaciendoTarde1200 from './assets/posters/se-esta-haciendo-tarde-1200.webp';

export interface Movie {
  title: string;
  year: number;
  genre: string;
  director: string;
  poster: {
    small: string;
    large: string;
    theme: 'red' | 'light' | 'deep';
    fallbackTitle: string;
  };
  trailerId?: string; // YouTube ID; optional until you have it
}

export const movies: Movie[] = [
  {
    title: 'El Origen del Lenguaje',
    year: 2025,
    genre: '[Género]',
    director: 'Ehiezem Alvarado',
    poster: {
      small: elOrigenDelLenguaje600,
      large: elOrigenDelLenguaje1200,
      theme: 'red',
      fallbackTitle: 'EL ORIGEN DEL LENGUAJE'
    },
    trailerId: 'kLcpvqs8pO8'
  },
  {
    title: 'El rey brujo',
    year: 2026,
    genre: '[Género]',
    director: 'Ehiezem Alvarado',
    poster: {
      small: elReyBrujo600,
      large: elReyBrujo1200,
      theme: 'light',
      fallbackTitle: 'El rey brujo'
    }
  },
  {
    title: 'Se está haciendo tarde',
    year: 2026,
    genre: '[Género]',
    director: 'Ehiezem Alvarado',
    poster: {
      small: seEstaHaciendoTarde600,
      large: seEstaHaciendoTarde1200,
      theme: 'deep',
      fallbackTitle: 'Se está haciendo tarde'
    }
  }
];
