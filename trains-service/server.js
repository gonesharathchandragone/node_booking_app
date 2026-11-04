const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'trains' }));
app.get('/', (req, res) => res.json(db.trains));

app.get('/search', (req, res) => {
  const { from, to } = req.query;
  res.json(db.trains.filter(t =>
    (!from || t.from.toLowerCase() === from.toLowerCase()) &&
    (!to || t.to.toLowerCase() === to.toLowerCase())
  ));
});

app.post('/book', (req, res) => {
  const { trainId, customerName, seats } = req.body;
  const train = db.trains.find(t => t.id === trainId);
  if (!train) return res.status(404).json({ error: 'Train not found' });
  if (train.seats < seats) return res.status(400).json({ error: 'Not enough seats' });

  train.seats -= seats;
  const booking = { id: uuidv4(), type: 'train', trainId, customerName, seats,
    totalPrice: train.price * seats, createdAt: new Date() };
  db.bookings.push(booking);
  res.status(201).json({ message: 'Train ticket booked', booking });
});

app.get('/bookings', (req, res) => res.json(db.bookings));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚆 Trains service on port ${PORT}`));
