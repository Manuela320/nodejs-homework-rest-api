const fs = require('fs/promises');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

async function listContacts() {
  const data = await fs.readFile(contactsPath, 'utf-8');
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const contacts = await listContacts();
  return contacts.find(contact => contact.id === contactId) || null;
}

async function removeContact(contactId) {
  const contacts = await listContacts();
  const newContacts = contacts.filter(contact => contact.id !== contactId);
  if (contacts.length === newContacts.length) return null;

  await fs.writeFile(contactsPath, JSON.stringify(newContacts, null, 2));
  return true;
}

async function addContact(newContact) {
  const contacts = await listContacts();
  const contact = { id: Date.now().toString(), ...newContact };
  contacts.push(contact);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contact;
}

async function updateContact(contactId, updates) {
  const contacts = await listContacts();
  const index = contacts.findIndex(contact => contact.id === contactId);
  if (index === -1) return null;

  contacts[index] = { ...contacts[index], ...updates };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[index];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};