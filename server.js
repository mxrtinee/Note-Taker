const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Set the path to the public directory
app.use(express.static('public'));

// Define a function to read the contents of the db.json file
const readNotesFromFile = () => {
  const data = fs.readFileSync(path.join(__dirname, 'db', 'db.json'), 'utf8');
  return JSON.parse(data);
};

// Define a function to write notes to the db.json file
const writeNotesToFile = (notes) => {
  fs.writeFileSync(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2));
};

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// GET request to '/api/notes' to retrieve all notes
app.get('/api/notes', (req, res) => {
  const notes = readNotesFromFile();
  res.json(notes);
});

// POST request to '/api/notes' to add a new note
// Save a new note route
app.post('/api/notes', (req, res) => {
	const newNote = req.body;
	newNote.id = uuidv4();

	// Read through notes and adds new note to 'db.json'
	fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		const notes = JSON.parse(data);

		notes.push(newNote);

		fs.writeFile(
			path.join(__dirname, '/db/db.json'),
			JSON.stringify(notes),
			(err) => {
				if (err) {
					console.error(err);
					return res
						.status(500)
						.json({ error: 'Internal Server Error' });
				}
				res.json(newNote);
			}
		);
	});
});

// DELETE request to '/api/notes/:id' to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteIdToDelete = req.params.id;

  let notes = readNotesFromFile();
  notes = notes.filter((note) => note.id !== noteIdToDelete);

  writeNotesToFile(notes);

  res.sendStatus(200);
});

// GET * should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

