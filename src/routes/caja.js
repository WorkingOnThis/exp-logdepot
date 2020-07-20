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

  console.log(data);

  if (data[1].length != 0) {
    for (let j in data[1]) {
      data[1][j]._id = uniqid();
      data[1][j].id_caja = data[0]._id;
      content.push(Object.values(data[1][j]));
    }
  }

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO cajas set ?", data[0], (err, cajas) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear caja",
          errors: err,
        });
      }

      conn.query(
        'UPDATE lugares SET estado = "1fxfv76sojrp12vdw" WHERE _id = ?',
        data[0].id_posicion,
        (err, estados) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al modificar estado",
              errors: err,
            });
          }

          if (data[1].length != 0) {
            conn.query(
              "INSERT INTO contenidos (txt_contenido, id_area, id_tipo, desde_n, hasta_n, desde_fecha, hasta_fecha, desde_letra, hasta_letra, observacion, _id, id_caja) VALUES ?",
              [content],
              (err, contenidos) => {
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
                  estado: estados[0],
                });
              }
            );
          } else {
            return res.status(201).json({
              ok: true,
              caja: cajas[0],
              estado: estados[0],
            });
          }
        }
      );
    });
  });
});

//===================================
// Agregar contenido
//===================================
app.post("/contenido", (req, res) => {
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

    conn.query("INSERT INTO contenidos set ?", [data], (err, contenido) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al agregar contenido",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        contenido: [data][0],
      });
    });
  });
});

//===================================
// Eliminar contenido
//===================================
app.delete("/contenido/:id", (req, res) => {
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
      "DELETE FROM contenidos WHERE _id = ?",
      [id],
      (err, contenido) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al agregar contenido",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          contenido: contenido,
        });
      }
    );
  });
});

//===================================
// Obtener contenido para vista
//===================================
app.get("/contenido/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT co.txt_contenido, ta.nombre as nombre_area, td.nombre as nombre_tipo, co.desde_n, co.hasta_n, " +
    " co.desde_fecha, co.hasta_fecha, co.desde_letra, co.hasta_letra, co.observacion, co._id " +
    "FROM contenidos as co " +
    "LEFT JOIN areas as ta ON ta._id = co.id_area " +
    "LEFT JOIN tipos_documento as td ON td._id = co.id_tipo " +
    "WHERE co.id_caja = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, [id], (err, contenidos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener contenido",
          errors: err,
        });
      }
      return res.status(200).json({
        ok: true,
        contenidos: contenidos,
      });
    });
  });
});

//===================================
// Obtener cajas
//===================================

app.get("/", (req, res, next) => {
  var consulta =
    "SELECT c._id, t.nombre as tipo_de_caja, e.nombre as empresa, " +
    "c.numero_caja as n_caja, l.nombre as ubicacion, c.id_codigo as codigo, c.precinto, c.prestamo, " +
    '(CASE WHEN c.id_usuario_alta IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_usuario_alta, ' +
    '(CASE WHEN c.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja, ' +
    "c.fecha_baja, c.fecha_alta " +
    "FROM cajas as c " +
    "INNER JOIN tipos_caja as t ON t._id = c.id_tipo_caja " +
    "INNER JOIN empresas as e ON e._id = c.id_empresa " +
    "LEFT JOIN lugares as l ON l._id = c.id_posicion " +
    "LEFT JOIN usuarios as u ON u._id = c.id_usuario_alta " +
    "LEFT JOIN usuarios as us ON us._id = c.id_usuario_baja";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, cajas) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        cajas: cajas,
      });
    });
  });
});

//===================================
// Obtener cajas
//===================================

app.get("/modaldeposito/:id", (req, res, next) => {
  var id = req.params.id;

  var consulta =
    "SELECT c._id, t.nombre as tipo_de_caja, e.nombre as empresa , c.numero_caja as n_caja, c.precinto, " +
    "l.nombre as ubicacion, c.id_codigo as codigo, c.id_usuario_alta, c.fecha_alta, c.id_usuario_baja, c.fecha_baja " +
    "FROM cajas as c " +
    "INNER JOIN tipos_caja as t ON t._id = c.id_tipo_caja " +
    "INNER JOIN empresas as e ON e._id = c.id_empresa " +
    "INNER JOIN lugares as l ON l._id = c.id_posicion " +
    "WHERE c.id_posicion = ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, [id], (err, cajas) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        cajas: cajas,
      });
    });
  });
});

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

      if (!caja[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "Esta caja no existe",
          errors: { message: "La caja no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        caja: caja[0],
      });
    });
  });
});

//===================================
// Anular caja
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
      "UPDATE cajas set fecha_baja = ?, id_usuario_baja = ? WHERE _id = ?",
      [datetime, body.id_usuario_baja, id],
      (err, cajaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al anular caja",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "caja anulada",
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
      "UPDATE cajas set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, caja) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "caja reestablecida",
        });
      }
    );
  });
});

//===================================
// Quitar lo anulado
//===================================
app.put("/cambiarnumero/:id", (req, res) => {
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
      "UPDATE cajas set numero_caja = ? WHERE _id = ?",
      [body.num_caja, id],
      (err, cajaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar caja",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Numero de caja actualizada",
        });
      }
    );
  });
});

//===================================
// Quitar lo anulado
//===================================
app.put("/posicionar/:id", (req, res) => {
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
      "UPDATE cajas set numero_caja = ?, id_posicion = ? WHERE _id = ?",
      [body.numero_caja, body.id_posicion, id],
      (err, cajaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar posición y numero de caja",
            errors: err,
          });
        }

        conn.query(
          'UPDATE lugares SET estado = "1fxfv76sojrp12vdw" WHERE _id = ?',
          [body.id_posicion],
          (err, estados) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: "Error al actualizar lugar en estante.",
                errors: err,
              });
            }

            return res.status(200).json({
              ok: true,
              mensaje: "Número de caja y posición actualizado.",
            });
          }
        );
      }
    );
  });
});

//===================================
// Actualizar caja
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
      "UPDATE cajas set ? WHERE _id = ?",
      [body, id],
      (err, cajaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar caja",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "caja actualizada",
        });
      }
    );
  });
});

// var consulta = 'SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha ' +
// 'desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, id_documento, E.nombre empresa ' +
// 'FROM contenidos as CNT ' +
// 'LEFT JOIN areas as AR ON AR._id = CNT.id_area ' +
// 'LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo ' +
// 'LEFT JOIN cajas as C ON C._id = CNT.id_caja ' +
// 'LEFT JOIN empresas as E ON E._id = C.id_empresa'

module.exports = app;
