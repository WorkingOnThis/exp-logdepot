const express = require("express");
const uniqid = require("uniqid");
const mdAuthentication = require("../middleweres/authentication");
const app = express();

//===================================
// Buscar empresa
//===================================
app.get("/:id", (req, res) => {
  var id = req.params.id;

  // SELECT E.color, L._id, L.nombre, L.id_estante, C.numero_caja
  // FROM lugares AS L
  // INNER JOIN estados AS E ON E._id = L.estado
  // INNER JOIN cajas AS C ON C.id_posicion = L._id
  // WHERE id_estante = ? ORDER BY _id ASC

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "SELECT E.color, L._id, L.nombre, L.id_estante, C.numero_caja, C.prestamo FROM lugares AS L INNER JOIN estados AS E ON E._id = L.estado LEFT JOIN cajas AS C ON C.id_posicion = L._id WHERE id_estante = ? ORDER BY _id ASC",
      [id],
      (err, lugares) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!lugares[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "Lugares no existente",
            errors: { message: "Lugares no existente" },
          });
        }

        return res.status(200).json({
          ok: true,
          lugares: lugares,
        });
      }
    );
  });
});

//===================================
// Buscar empresa
//===================================
app.get("/especifico/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    'SELECT CONCAT(E.deposito, " ", L.nombre) as nombre ' +
    "FROM lugares as L " +
    "LEFT JOIN estantes as E ON E._id = L.id_estante " +
    "WHERE L._id = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, lugar) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!lugar[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "lugar no existente",
          errors: { message: "lugar no existente" },
        });
      }

      return res.status(200).json({
        ok: true,
        lugar: lugar[0],
      });
    });
  });
});

// //===================================
// // Buscar empresa
// //===================================
// app.get('/estante/:id', (req, res) => {

//     var id = req.params.id;

//     req.getConnection((err, conn) => {

//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al conectar con la base de datos.',
//                 error: err
//             });
//         }

//         conn.query('SELECT * FROM lugares WHERE _id = ?', [id], (err, lugar) => {

//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error en la DB',
//                     errors: err
//                 });
//             }

//             if (!lugar[0]) {
//                 return res.status(400).json({
//                     ok: true,
//                     mensaje: 'lugar no existente',
//                     errors: { message: 'lugar no existente' }
//                 });
//             }

//             res.status(200).json({
//                 ok: true,
//                 lugar: lugar
//             });

//         });
//     });
// })

//==================================================================
// Obtener todos los espacios vacios a partir de un id de estante
//==================================================================

app.get("/vacio/:id", (req, res, next) => {
  var id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(
      'SELECT _id, nombre FROM lugares WHERE estado = "1fxfv7710jqemzzbf" AND id_estante = ?',
      [id],
      (err, lugares) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          lugares: lugares,
        });
      }
    );
  });
});

//===================================
// Liberar Lugar
//===================================
app.put("/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "UPDATE cajas, lugares set cajas.id_posicion = null, lugares.estado = '1fxfv7710jqemzzbf' WHERE cajas.id_posicion = lugares._id AND cajas._id = ?",
      [id],
      (err, cajaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar usuario",
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mensaje: cajaActualizada,
        });
      }
    );
  });
});

module.exports = app;
