const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'movies' }));
app.get('/', (req, res) => res.json(db.movies));

app.get('/search', (req, res) => {
  const { title } = req.query;
  res.json(db.movies.filter(m => m.title.toLowerCase().includes((title || '').toLowerCase())));
});

app.post('/book', (req, res) => {
  const { movieId, customerName, seats } = req.body;
  const movie = db.movies.find(m => m.id === movieId);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  if (movie.seats < seats) return res.status(400).json({ error: 'Not enough seats' });

  movie.seats -= seats;
  const booking = { id: uuidv4(), type: 'movie', movieId, customerName, seats,
    totalPrice: movie.price * seats, createdAt: new Date() };
  db.bookings.push(booking);
  res.status(201).json({ message: 'Movie ticket booked', booking });
});

app.get('/bookings', (req, res) => res.json(db.bookings));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎬 Movies service on port ${PORT}`));
