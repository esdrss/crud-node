const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json()); // habilita JSON no corpo da requisição

// Banco em memória
const db = new sqlite3.Database(':memory:');

// Cria a tabela
db.serialize(() => {
  db.run("CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)");
});

// CREATE (POST)
app.post('/api/produtos', (req, res) => {
  const { nome, preco } = req.body;
  db.run("INSERT INTO produtos (nome, preco) VALUES (?, ?)", [nome, preco], function(err) {
    if (err) return res.status(500).send(err.message);
    res.json({ id: this.lastID, nome, preco });
  });
});

// READ (GET todos)
app.get('/api/produtos', (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// READ (GET por ID)
app.get('/api/produtos/:id', (req, res) => {
  db.get("SELECT * FROM produtos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (row) res.json(row);
    else res.status(404).send("Produto não encontrado");
  });
});

// UPDATE (PUT)
app.put('/api/produtos/:id', (req, res) => {
  const { nome, preco } = req.body;
  db.run("UPDATE produtos SET nome = ?, preco = ? WHERE id = ?", [nome, preco, req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.send("Produto atualizado");
  });
});

// DELETE
app.delete('/api/produtos/:id', (req, res) => {
  db.run("DELETE FROM produtos WHERE id = ?", req.params.id, (err) => {
    if (err) return res.status(500).send(err.message);
    res.send("Produto deletado");
  });
});

// Inicia servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});