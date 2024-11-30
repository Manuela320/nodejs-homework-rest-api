const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Joi = require('joi');
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require('./models/contacts'); // Importă funcțiile din contacts.js

// Joi Schema pentru validare
const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]+$/),
}).min(1); // Asigură-te că cel puțin un câmp este prezent

// Inițializare Express
const app = express();
const PORT = 4000;

// Middleware
app.use(morgan('dev')); // Loguri pentru cererile HTTP
app.use(cors()); // Permite Cross-Origin Resource Sharing
app.use(express.json()); // Parsare JSON

// Rute

// 1. GET /api/contacts - Obține toate contactele
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. GET /api/contacts/:id - Obține un contact după ID
app.get('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. POST /api/contacts - Creează un contact nou
app.post('/api/contacts', async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. DELETE /api/contacts/:id - Șterge un contact după ID
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await removeContact(id);
    if (!result) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 5. PUT /api/contacts/:id - Actualizează un contact după ID
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = updateContactSchema.validate(req.body, { allowUnknown: true, stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedContact = await updateContact(id, req.body);
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route default pentru 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Pornește serverul
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});