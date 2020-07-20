const express = require("express");
const uniqid = require("uniqid");
const app = express();

//===================================
// Crear una nueva caja
//===================================
app.post("/entrada/caja/etiquetac", (req, res) => {
  const data = req.body;
  var movimientos = [];
  var codigos = "(";

  for (let j in data) {
    data[j]._id = uniqid();
    data[j].fecha_alta = new Date();
    codigos += "'" + data[j].codigo + "'" + ",";
    movimientos.push(Object.values(data[j]));
  }

  codigos = codigos.slice(0, -1);
  codigos += ")";

  var consultaEtiquetas =
    "UPDATE etiquetas SET estado = 1 WHERE _id IN " + codigos;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "INSERT INTO movimientos (codigo, accion, tipo_prod, asociacion, observacion, id_usuario_alta, fecha_alta, id_usuario_baja, fecha_baja, _id) VALUES ?",
      [movimientos],
      (err, movimientos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al insertar movimiento",
            errors: err,
          });
        }

        conn.query(consultaEtiquetas, (err, etiquetas) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar etiqueta",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            movimientos: movimientos[0],
            etiquetas: etiquetas[0],
          });
        });
      }
    );
  });
});

app.post("/entrada/caja/etiquetau", (req, res) => {
  const data = req.body;
  var movimientos = [];
  var codigos = "(";

  for (let j in data) {
    data[j]._id = uniqid();
    data[j].fecha_alta = new Date();
    codigos += "'" + data[j].codigo + "'" + ",";
    movimientos.push(Object.values(data[j]));
  }

  codigos = codigos.slice(0, -1);
  codigos += ")";

  var consultaCajas =
    "UPDATE cajas SET prestamo = 0 WHERE id_codigo IN " + codigos;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "INSERT INTO movimientos (codigo, accion, tipo_prod, asociacion, observacion, id_usuario_alta, fecha_alta, id_usuario_baja, fecha_baja, _id) VALUES ?",
      [movimientos],
      (err, movimientos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al insertar movimiento",
            errors: err,
          });
        }

        conn.query(consultaCajas, (err, etiquetas) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar etiqueta",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            movimientos: movimientos[0],
            etiquetas: etiquetas[0],
          });
        });
      }
    );
  });
});

app.post("/entrada/documento", (req, res) => {
  const data = req.body;
  var movimientos = [];
  var codigos = "(";

  for (let j in data) {
    data[j]._id = uniqid();
    data[j].fecha_alta = new Date();
    codigos += "'" + data[j].codigo + "'" + ",";
    movimientos.push(Object.values(data[j]));
  }

  codigos = codigos.slice(0, -1);
  codigos += ")";

  var consultaDocumentos =
    "UPDATE documentos SET prestamo = 0 WHERE id_codigo IN " + codigos;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "INSERT INTO movimientos (codigo, accion, tipo_prod, asociacion, observacion, id_usuario_alta, fecha_alta, id_usuario_baja, fecha_baja, _id) VALUES ?",
      [movimientos],
      (err, movimientos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al insertar movimiento",
            errors: err,
          });
        }

        conn.query(consultaDocumentos, (err, etiquetas) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar etiqueta",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            movimientos: movimientos[0],
            etiquetas: etiquetas[0],
          });
        });
      }
    );
  });
});

app.post("/salida/caja", (req, res) => {
  const data = req.body;
  var movimientos = [];
  var codigos = "(";

  for (let j in data) {
    data[j]._id = uniqid();
    data[j].fecha_alta = new Date();
    codigos += "'" + data[j].codigo + "'" + ",";
    movimientos.push(Object.values(data[j]));
  }

  codigos = codigos.slice(0, -1);
  codigos += ")";

  var consultaCajas =
    "UPDATE cajas SET prestamo = 1 WHERE id_codigo IN " + codigos;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "INSERT INTO movimientos (codigo, accion, tipo_prod, asociacion, observacion, id_usuario_alta, fecha_alta, id_usuario_baja, fecha_baja, _id) VALUES ?",
      [movimientos],
      (err, movimientos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al insertar movimiento",
            errors: err,
          });
        }

        conn.query(consultaCajas, (err, etiquetas) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar etiqueta",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            movimientos: movimientos[0],
            etiquetas: etiquetas[0],
          });
        });
      }
    );
  });
});

app.post("/salida/documento", (req, res) => {
  const data = req.body;
  var movimientos = [];
  var codigos = "(";

  for (let j in data) {
    data[j]._id = uniqid();
    data[j].fecha_alta = new Date();
    codigos += "'" + data[j].codigo + "'" + ",";
    movimientos.push(Object.values(data[j]));
  }

  codigos = codigos.slice(0, -1);
  codigos += ")";

  var consultaDocumentos =
    "UPDATE documentos SET prestamo = 1 WHERE id_codigo IN " + codigos;
  var consultaEtiquetas =
    "UPDATE etiquetas SET estado = 1 WHERE _id IN " + codigos;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "INSERT INTO movimientos (codigo, accion, tipo_prod, asociacion, observacion, id_usuario_alta, fecha_alta, id_usuario_baja, fecha_baja, _id) VALUES ?",
      [movimientos],
      (err, movimientos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al insertar movimiento",
            errors: err,
          });
        }

        conn.query(consultaDocumentos, (err, documentos) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar documento",
              errors: err,
            });
          }

          conn.query(consultaEtiquetas, (err, etiquetas) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: "Error al modificar etiqueta",
                errors: err,
              });
            }

            return res.status(201).json({
              ok: true,
              movimientos: movimientos[0],
              documentos: documentos[0],
              etiquetas: etiquetas[0],
            });
          });
        });
      }
    );
  });
});

//===================================
// Obtener cajas
//===================================

app.get("/", (req, res, next) => {
  // var consulta = 'SELECT c._id, t.nombre as tipo_de_caja, e.nombre as empresa, ' +
  //     'c.numero_caja as n_caja, l.nombre as ubicacion, c.id_codigo as codigo, c.precinto, c.prestamo, ' +
  //     '(CASE WHEN c.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_usuario_alta, ' +
  //     '(CASE WHEN c.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja, ' +
  //     'c.fecha_baja, c.fecha_alta ' +
  //     'FROM cajas as c ' +
  //     'INNER JOIN tipos_caja as t ON t._id = c.id_tipo_caja ' +
  //     'INNER JOIN empresas as e ON e._id = c.id_empresa ' +
  //     'LEFT JOIN lugares as l ON l._id = c.id_posicion ' +
  //     'LEFT JOIN usuarios as u ON u._id = c.id_usuario_alta ' +
  //     'LEFT JOIN usuarios as us ON us._id = c.id_usuario_baja';
  // '(CASE WHEN u.id_creador IS NOT NULL THEN CONCAT(ut.nombre , " " , ut.apellido) END) as id_creador, ' +

  // var consulta = 'SELECT * ' +
  //     'FROM movimientos';

  var consulta =
    "SELECT m._id, accion, tipo_prod, em.nombre empresa, codigo, asociacion, observacion, m.fecha_alta, " +
    '(CASE WHEN m.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre, " ", u.apellido) END) id_usuario_alta ' +
    "FROM movimientos m " +
    "LEFT JOIN usuarios u ON u._id = m.id_usuario_alta " +
    "LEFT JOIN etiquetas e ON e._id = m.codigo " +
    "LEFT JOIN lotes l ON l._id = e.id_lote " +
    "LEFT JOIN empresas em ON em._id = l.id_empresa";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, movimientos) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        movimientos: movimientos,
      });
    });
  });
});

module.exports = app;
