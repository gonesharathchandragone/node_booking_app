const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'buses' }));
app.get('/', (req, res) => res.json(db.buses));

app.get('/search', (req, res) => {
  const { from, to } = req.query;
  res.json(db.buses.filter(b =>
    (!from || b.from.toLowerCase() === from.toLowerCase()) &&
    (!to || b.to.toLowerCase() === to.toLowerCase())
  ));
});

app.post('/book', (req, res) => {
  const { busId, customerName, seats } = req.body;
  const bus = db.buses.find(b => b.id === busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  if (bus.seats < seats) return res.status(400).json({ error: 'Not enough seats' });

  bus.seats -= seats;
  const booking = { id: uuidv4(), type: 'bus', busId, customerName, seats,
    totalPrice: bus.price * seats, createdAt: new Date() };
  db.bookings.push(booking);
  res.status(201).json({ message: 'Bus ticket booked', booking });
});

app.get('/bookings', (req, res) => res.json(db.bookings));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚌 Buses service on port ${PORT}`));
