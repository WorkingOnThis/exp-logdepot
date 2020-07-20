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

    conn.query("INSERT INTO tipos_caja set ?", [data], (err, tiposCaja) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear estado",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        tiposCaja: tiposCaja,
      });
    });
  });
});

//===================================
// Obtener todos estados
//===================================

app.get("/", (req, res, next) => {
  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query("SELECT * FROM tipos_caja", (err, tiposCaja) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        tiposCaja: tiposCaja,
      });
    });
  });
});

module.exports = app;
