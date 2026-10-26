import { tmdb, posterUrl, backdropUrl } from "../lib/tmdb.js";

function mapMovie(m) {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    releaseDate: m.release_date,
    rating: m.vote_average,
    poster: posterUrl(m.poster_path),
    backdrop: backdropUrl(m.backdrop_path),
    raw: m,
  };
}

export async function getPopularMovies(page = 1) {
  const data = await tmdb.popular(page);
  return {
    page: data.page,
    totalPages: data.total_pages,
    results: (data.results || []).map(mapMovie),
  };
}

export async function searchMovies(query, page = 1) {
  const data = await tmdb.search(query, page);
  return {
    page: data.page,
    totalPages: data.total_pages,
    results: (data.results || []).map(mapMovie),
  };
}

export async function getMovieDetail(id) {
  const [movie, credits, videos] = await Promise.all([
    tmdb.movie(id),
    tmdb.credits(id),
    tmdb.videos(id),
  ]);

  return {
    ...mapMovie(movie),
    runtime: movie.runtime,
    genres: movie.genres || [],
    cast: (credits.cast || []).slice(0, 12),
    trailer: (videos.results || []).find(
      (v) => v.site === "YouTube" && v.type === "Trailer"
    ),
  };
}
