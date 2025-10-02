// utils/movieMapper.js
export const mapMovies = (apiMovies) => {
  return apiMovies.map((m) => ({
    id: m.id,
    title: m.title,
    duration: m.durationMinutes,
    description: m.description,
    posterUrl: m.posterUrl,
    genres: m.genres, // array
  }));
};
