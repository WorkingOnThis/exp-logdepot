const express = require("express");
const app = express();

//===================================
// Buscar caja
//===================================
app.get("/:id", (req, res) => {
  var id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("SELECT * FROM cajas WHERE _id = ?", [id], (err, caja) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      return res.status(200).json({
        ok: true,
        caja: caja[0],
      });
    });
  });
});

module.exports = app;
