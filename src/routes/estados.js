const express = require("express");
const uniqid = require("uniqid");
const app = express();

//===================================
// Crear un nuevo usuario
//===================================
app.post("/", (req, res) => {
  const data = req.body;
  data._id = uniqid();

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO estados set ?", [data], (err, estadoAlmacenado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear estado",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        estado: estadoAlmacenado,
      });
    });
  });
});

//===================================
// Obtener todos estados
//===================================

app.get("/tipo/:tipo", (req, res, next) => {
  var tipo = req.params.tipo;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(
      "SELECT * FROM estados WHERE tipo = ?",
      [tipo],
      (err, estados) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          estados: estados,
        });
      }
    );
  });
});

//===================================
// Obtener todos estados
//===================================

app.get("/caja", (req, res, next) => {
  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query('SELECT * FROM estados WHERE tipo = "caja"', (err, estados) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        estados: estados,
      });
    });
  });
});

module.exports = app;
