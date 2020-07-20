const express = require("express");
const uniqid = require("uniqid");
const app = express();

//===================================
// Crear una nueva caja
//===================================
app.post("/", (req, res) => {
  var content = [];

  const data = req.body;

  data[0]._id = uniqid();

  data[1]._id = uniqid();

  data[1].id_documento = data[0]._id;

  console.log(data[1]);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO documentos set ?", data[0], (err, cajas) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear documento",
          errors: err,
        });
      }

      conn.query("INSERT INTO contenidos set ?", data[1], (err, contenidos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al crear contenido",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          caja: cajas[0],
          contenido: contenidos[0],
        });
      });
    });
  });
});

//===================================
// Obtener todos los documentos
//===================================

app.get("/", (req, res, next) => {
  var consulta =
    "SELECT D._id, D.id_codigo, C.id_codigo as codigo_caja, D.id_solicitud, D.fecha_alta, D.fecha_baja, D.prestamo, " +
    '(CASE WHEN D.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_usuario_alta, ' +
    '(CASE WHEN D.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja ' +
    "FROM documentos as D " +
    "LEFT JOIN cajas as C ON C._id = D.id_caja " +
    "LEFT JOIN usuarios as u ON u._id = D.id_usuario_alta " +
    "LEFT JOIN usuarios as us ON us._id = D.id_usuario_baja";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, documentos) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        documentos: documentos,
      });
    });
  });
});

//===================================
// Obtener contenido para vista
//===================================
app.get("/contenido/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT co.txt_contenido, co.id_area, co.id_tipo, co.desde_n, co.hasta_n, " +
    " co.desde_fecha, co.hasta_fecha, co.desde_letra, co.hasta_letra, co.observacion, co._id " +
    "FROM contenidos as co " +
    // 'LEFT JOIN areas as ta ON ta._id = co.id_area ' +
    // 'LEFT JOIN tipos_documento as td ON td._id = co.id_tipo ' +
    "WHERE co.id_documento = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, [id], (err, contenido) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener contenido",
          errors: err,
        });
      }
      return res.status(200).json({
        ok: true,
        contenido: contenido[0],
      });
    });
  });
});

//===================================
// Buscar documento
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

    conn.query(
      "SELECT * FROM documentos WHERE _id = ?",
      [id],
      (err, documento) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!documento[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "Este documento no existe",
            errors: { message: "El documento no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          documento: documento[0],
        });
      }
    );
  });
});

//===================================
// Anular documento
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
      "UPDATE documentos set fecha_baja = ?, id_usuario_baja = ? WHERE _id = ?",
      [datetime, body.id_usuario_baja, id],
      (err, documentoActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al anular documento",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "documento anulado",
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
      "UPDATE documentos set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, documento) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "documento reestablecido",
        });
      }
    );
  });
});

//===================================
// Anular documento
//===================================

app.put("/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;

  console.log(body);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "UPDATE documentos set ? WHERE _id = ?",
      [body[0], id],
      (err, documentoActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar documento",
            errors: err,
          });
        }

        conn.query(
          "UPDATE contenidos set ? WHERE _id = ?",
          [body[1], body[1]._id],
          (err, contenidos) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: "Error al crear contenido",
                errors: err,
              });
            }

            return res.status(200).json({
              ok: true,
              mensaje: "documento y contenido actualizado.",
            });
          }
        );

        // return res.status(200).json({
        //     ok: true,
        //     mensaje: 'documento actualizado.'
        // });
      }
    );
  });
});

module.exports = app;
