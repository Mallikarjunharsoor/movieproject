import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearAuth, getStoredUser } from "../api";

function MovieRow({ title, items }) {
  return (
    <section className="movie-row">
      <h3>{title}</h3>
      <div className="movie-strip">
        {items.map((movie) => (
          <article key={movie.imdbID} className="movie-card">
            <img src={movie.Poster} alt={movie.Title} loading="lazy" />
            <div className="movie-meta">
              <p>{movie.Title}</p>
              <span>{movie.Year}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/movies/featured")
      .then((data) => {
        setRows(data.rows || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function doSearch(event) {
    event.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const data = await apiRequest(`/movies/search?q=${encodeURIComponent(query)}`);
      setResults(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    clearAuth();
    navigate("/login");
  }

  const hero = rows?.[0]?.items?.[0];

  return (
    <main className="home-page">
      <header className="top-nav">
        <h2>MOVIEFLIX</h2>
        <div>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="hero" style={hero ? { backgroundImage: `url(${hero.Poster})` } : undefined}>
        <div className="hero-shade" />
        <div className="hero-content">
          <h1>{hero ? hero.Title : "Unlimited movies, stories and action."}</h1>
          <p>Watch what you love. Search your favorites from OMDb.</p>
          <form onSubmit={doSearch} className="search-form">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {error && <p className="error center">{error}</p>}

      {results.length > 0 && <MovieRow title="Search Results" items={results} />}

      {rows.map((row) => (
        <MovieRow key={row.title} title={row.title} items={row.items || []} />
      ))}
    </main>
  );
}