const express = require("express");
const app = express();

//===================================
// Obtener todos estados
//===================================

app.get("/:id", (req, res, next) => {
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
      "SELECT * FROM etiquetas WHERE _id = ?",
      [id],
      (err, etiqueta) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          etiqueta: etiqueta[0],
        });
      }
    );
  });
});

//===================================
// Obtener todas las etiquetas
//===================================

app.get("/", (req, res, next) => {
  var consulta =
    "SELECT ET._id as _id, L.numero as lote, L.tipo, ET._id as codigo, ET.estado as estado, ET.num_etiqueta, " +
    '(CASE WHEN ET.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja, ' +
    "ET.fecha_baja " +
    "FROM etiquetas as ET LEFT JOIN lotes as L ON L._id = ET.id_lote " +
    "LEFT JOIN usuarios as us ON us._id = ET.id_usuario_baja";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, etiquetas) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        etiquetas: etiquetas,
      });
    });
  });
});

//==============================================
// Obtener todas las etiquetas a partir del id del lote
//==============================================

app.get("/lote/:id", (req, res, next) => {
  var id = req.params.id;

  var consulta =
    "SELECT e._id, e.id_lote, e.fecha_baja, e.id_usuario_baja, l.id_empresa, EM.nombre as nom_empresa, e.num_etiqueta, " +
    "l.tipo, l.numero, l.cantidad, l.id_usuario_alta, l.id_usuario_baja as usuario_baja_lote, " +
    "l.fecha_alta, l.fecha_baja as fecha_baja_lote, e.estado " +
    "FROM etiquetas as e " +
    "INNER JOIN lotes as l ON e.id_lote = l._id " +
    "LEFT JOIN empresas as EM ON EM._id = l.id_empresa " +
    "WHERE e._id = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, etiqueta) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        etiqueta: etiqueta[0],
      });
    });
  });
});

//==============================================
// Obtener todas los lotes a partir del id de la empresa
//==============================================

// app.get('/lote/:id', (req, res, next) => {

//     var id = req.params.id;

//     var consulta = 'SELECT e._id, e.id_lote, e.fecha_baja, e.id_usuario_baja, l.id_empresa, ' +
//     'l.tipo, l.numero, l.cantidad, l.id_usuario_alta, l.id_usuario_baja as usuario_baja_lote, ' +
//     'l.fecha_alta, l.fecha_baja as fecha_baja_lote, e.estado ' +
//     'FROM etiquetas as e ' +
//     'INNER JOIN lotes as l ON e.id_lote = l._id WHERE e._id = ?';

//     req.getConnection((err, conn) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al conectar con la base de datos.',
//                 error: err
//             });
//         }

//         conn.query(consulta, [id], (err, etiqueta) => {
//             if (err) {
//                 res.json(err);
//             }
//             res.status(200).json({
//                 ok: true,
//                 etiqueta: etiqueta[0]
//             });
//         });
//     });
// });

//===================================
// Anular etiqueta
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
      "UPDATE etiquetas set fecha_baja = ?, id_usuario_baja = ? WHERE _id = ?",
      [datetime, body.usuario_baja, id],
      (err, etiquetaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al anular etiqueta",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "etiqueta anulada",
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
      "UPDATE etiquetas set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, etiqueta) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "etiqueta reestablecida",
        });
      }
    );
  });
});

//===================================
// Buscar etiqueta existente
//===================================
app.get("/existetiqueta/:id", (req, res) => {
  var id = req.params.id;

  console.log(id);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "SELECT * FROM etiquetas WHERE _id = ?",
      [id],
      (err, etiqueta) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!etiqueta[0]) {
          return res.status(200).json({
            ok: true,
            mensaje: "La etiqueta no existe",
            errors: { message: "La etiqueta no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "La etiqueta ya existe",
          etiqueta: etiqueta[0],
        });
      }
    );
  });
});

//===================================
// Buscar etiqueta existente
//===================================
app.get("/existetiquetamov/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT E.*, L.tipo, MV.accion FROM etiquetas E " +
    "LEFT JOIN LOTES L ON E.id_lote = L._id " +
    "LEFT JOIN (SELECT _id, max(fecha_alta) maxfecha, codigo, accion from MOVIMIENTOS GROUP BY codigo) M ON E._id = M.codigo " +
    "LEFT JOIN MOVIMIENTOS MV ON E._id = MV.codigo AND MV.fecha_alta = M.maxfecha AND M.maxfecha IS NOT NULL " +
    "WHERE E._id = ?";

  // SELECT E.*, L.tipo, MV.accion FROM etiquetas E
  // LEFT JOIN LOTES L ON E.id_lote = L._id
  // LEFT JOIN (SELECT _id, max(fecha_alta) maxfecha, codigo, accion from MOVIMIENTOS GROUP BY codigo) M ON E._id = M.codigo
  // LEFT JOIN MOVIMIENTOS MV ON E._id = M.codigo AND MV.fecha_alta = M.maxfecha AND M.maxfecha IS NOT NULL
  // WHERE E._id = '1fxfv73lgjurphn1x'

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, etiqueta) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!etiqueta[0]) {
        return res.status(200).json({
          ok: true,
          mensaje: "La etiqueta no existe",
          errors: { message: "La etiqueta no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: "La etiqueta ya existe",
        etiqueta: etiqueta[0],
      });
    });
  });
});

// SELECT E.*, L.tipo FROM etiquetas E
// LEFT JOIN LOTES L ON E.id_lote = L._id
// WHERE E._id = ''

// SELECT E.*, L.tipo, MV.accion FROM etiquetas E
// LEFT JOIN LOTES L ON E.id_lote = L._id
// LEFT JOIN (SELECT _id, max(fecha_alta) maxfecha, codigo, accion from MOVIMIENTOS GROUP BY codigo) M ON E._id = M.codigo
// LEFT JOIN MOVIMIENTOS MV ON E._id = M.codigo AND MV.fecha_alta = M.maxfecha AND M.maxfecha IS NOT NULL
// WHERE E._id = '1fxfv73lgjurpi0ph'

// -- '1fxfv73lgjurphn1w' - EXISTE
// -- 'x5cyw420jvs8o4n6' - EXISTE

// -- '1fxfv73lgjurpi0ph' - NO EXISTE

//===================================
// Buscar etiqueta existente
//===================================
// LO CORRECTO EN ESTE SERVICIO SERIA TRAER ETIQUETA DEL TIPO QUE CORRESPONDA. DANDO EL TIPO COMO PARAMETRO.
app.get("/etiquetaocupada/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "select * " +
    "from ( " +
    "    select id_codigo from cajas " +
    "    union all " +
    "    select id_codigo from documentos " +
    ") a " +
    "where id_codigo = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, etiqueta) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!etiqueta[0]) {
        return res.status(200).json({
          ok: true,
          mensaje: "La etiqueta no esta en uso",
          errors: { message: "La etiqueta no esta en uso" },
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: "La etiqueta ya esta en uso",
        etiqueta: etiqueta[0],
      });
    });
  });
});

module.exports = app;
