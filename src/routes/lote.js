const express = require("express");
const uniqid = require("uniqid");
const app = express();

//===================================
// Crear un nuevo lote y sus etiquetas
//===================================
app.post("/", (req, res) => {
  var etiquetas = [];
  const data = req.body;
  var num = 1;

  data[0]._id = uniqid();

  for (let j in data) {
    if (data[j] != data[0]) {
      data[j]._id = uniqid();
      data[j].id_lote = data[0]._id;
      data[j].num_etiqueta = num++;
    }
    etiquetas.push(Object.values(data[j]));
  }

  etiquetas.shift();

  console.log(data[0]);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO lotes set ?", data[0], (err, lote) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear lote",
          errors: err,
        });
      }

      conn.query(
        "INSERT INTO etiquetas (_id, id_lote, num_etiqueta) VALUES ?",
        [etiquetas],
        (err, etiqueta) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al crear etiqueta",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            lote: lote,
            etiqueta: etiqueta,
          });
        }
      );
    });
  });
});

//========================================
// Obtener el ultimo lote y sus etiquetas
//========================================
app.get("/", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "SELECT * FROM etiquetas WHERE id_lote = (SELECT _id FROM lotes ORDER BY numero DESC LIMIT 1)",
      (err, lote) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al crear lote",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          lote: lote,
        });
      }
    );
  });
});

//========================================
// Obtener todos los lotes existentes
//========================================
app.get("/tabla", (req, res) => {
  var consulta =
    "SELECT L._id as _id, E.nombre as empresa, L.tipo, L.numero, L.cantidad, " +
    '(CASE WHEN L.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_usuario_alta, ' +
    '(CASE WHEN L.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja, ' +
    "L.fecha_baja, L.fecha_alta " +
    "FROM lotes as L LEFT JOIN empresas as E ON E._id = L.id_empresa " +
    "LEFT JOIN usuarios as u ON u._id = L.id_usuario_alta " +
    "LEFT JOIN usuarios as us ON us._id = L.id_usuario_baja";

  // SELECT E.nombre as empresa, L.tipo, L.numero, L.cantidad,
  // (CASE WHEN L.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_usuario_alta,
  // (CASE WHEN L.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja,
  // L.fecha_baja, L.fecha_alta
  // FROM lotes as L LEFT JOIN empresas as E ON E._id = L.id_empresa
  // LEFT JOIN usuarios as u ON u._id = L.id_usuario_alta
  // LEFT JOIN usuarios as us ON us._id = L.id_usuario_baja

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, (err, lotes) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener lotes",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        lote: lotes,
      });
    });
  });
});

//========================================
// Obtener el ultimo lote y sus etiquetas
//========================================
app.get("/infolote", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("SELECT * FROM lotes ORDER BY numero DESC", (err, lotes) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener todos los lotes",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        lote: lotes,
      });
    });
  });
});

//========================================
// Obtener el ultimo lote y sus etiquetas
//========================================
app.get("/:id", (req, res) => {
  var id = req.params.id;

  consulta =
    "SELECT e._id _id, num_etiqueta, estado, l.cantidad, l.numero, l.tipo, emp.nombre empresa " +
    "FROM etiquetas e " +
    "LEFT JOIN lotes l ON e.id_lote = l._id " +
    "LEFT JOIN empresas emp ON l.id_empresa = emp._id " +
    "WHERE e.id_lote = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, lote) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "No se encontró el lote buscado.",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        lote: lote,
      });
    });
  });
});

//===================================
// Buscar caja
//===================================
app.get("/tabla/:id", (req, res) => {
  var id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("SELECT * FROM lotes WHERE _id = ?", [id], (err, lote) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!lote[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "Este lote no existe",
          errors: { message: "El lote no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        lote: lote[0],
      });
    });
  });
});

//===================================
// Anular lote
//===================================

app.put("/anular/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;
  let datetime = new Date();

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "UPDATE lotes set fecha_baja = ?, id_usuario_baja = ? WHERE _id = ?",
      [datetime, body.id_usuario_baja, id],
      (err, loteActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al anular lote",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "lote anulado",
        });
      }
    );
  });
});

//===================================
// Quitar lo anulado
//===================================

app.put("/desanular/:id", (req, res) => {
  var id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    // conn.query("SELECT * FROM recibos WHERE fecha_baja IS NULL or fecha_baja = ''", (err, recibos) => {
    conn.query(
      "UPDATE lotes set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, lote) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "lote reestablecido",
        });
      }
    );
  });
});

module.exports = app;
