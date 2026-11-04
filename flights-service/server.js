const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'flights' }));
app.get('/', (req, res) => res.json(db.flights));

app.get('/search', (req, res) => {
  const { from, to } = req.query;
  res.json(db.flights.filter(f =>
    (!from || f.from.toLowerCase() === from.toLowerCase()) &&
    (!to || f.to.toLowerCase() === to.toLowerCase())
  ));
});

app.post('/book', (req, res) => {
  const { flightId, customerName, seats } = req.body;
  const flight = db.flights.find(f => f.id === flightId);
  if (!flight) return res.status(404).json({ error: 'Flight not found' });
  if (flight.seats < seats) return res.status(400).json({ error: 'Not enough seats' });

  flight.seats -= seats;
  const booking = { id: uuidv4(), type: 'flight', flightId, customerName, seats,
    totalPrice: flight.price * seats, createdAt: new Date() };
  db.bookings.push(booking);
  res.status(201).json({ message: 'Flight ticket booked', booking });
});

app.get('/bookings', (req, res) => res.json(db.bookings));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✈️ Flights service on port ${PORT}`));
