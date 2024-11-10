import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://swapi.dev/api/films/");
      if (!response.ok) throw new Error("Failed to fetch movies.");

      const data = await response.json();
      const transformedMovies = data.results.map((movie) => ({
        id: movie.episode_id,
        title: movie.title,
        releaseDate: movie.release_date,
        openingText: movie.opening_crawl,
      }));

      setMovies(transformedMovies);
      setRetrying(false);
    } catch {
      setError("Something went wrong... Retrying");
      setRetrying(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (retrying) {
      const retryTimeout = setTimeout(fetchMovies, 5000);
      return () => clearTimeout(retryTimeout); // Cleanup timeout on unmount
    }
  }, [retrying, fetchMovies]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    const cleanup = handleRetry();
    return () => cleanup && cleanup();
  }, [handleRetry]);

  const handleCancelRetry = useCallback(() => {
    setRetrying(false);
    setError("Retrying canceled by user.");
  }, []);

  const movieCards = useMemo(
    () =>
      movies.map((movie) => (
        <Col key={movie.id} md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>{movie.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
              </Card.Subtitle>
              <Card.Text>{movie.openingText.slice(0, 150)}...</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      )),
    [movies]
  );

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h2>Star Wars Movies</h2>
        <Button
          variant="primary"
          onClick={fetchMovies}
          disabled={isLoading || retrying}
        >
          Fetch Movies
        </Button>
      </div>

      {error && (
        <div className="text-center">
          <p className="text-danger">{error}</p>
          {retrying && (
            <Button variant="danger" onClick={handleCancelRetry}>
              Cancel Retry
            </Button>
          )}
        </div>
      )}

      {!isLoading && movies.length === 0 && !error && (
        <p className="text-center">
          No movies found. Click "Fetch Movies" to load data.
        </p>
      )}

      <Row>{movieCards}</Row>

      {/* Full-Screen Loader Modal */}
      <Modal show={isLoading} centered backdrop="static">
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" variant="primary" />
          <span className="ml-3">Loading movies...</span>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Movies;
