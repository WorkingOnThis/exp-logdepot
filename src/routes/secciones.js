const express = require("express");
const uniqid = require("uniqid");
const mdAuthentication = require("../middleweres/authentication");
const app = express();

//===================================
// Crear una nueva empresa
//===================================
app.post("/", (req, res) => {
  var tipos = [];

  const data = req.body;

  for (let j in data) {
    data[j]._id = uniqid();
    if (data[j] != data[0]) {
      data[j].id_area = data[0]._id;
    }
    tipos.push(Object.values(data[j]));
  }

  tipos.shift();

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO areas set ?", data[0], (err, area) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear area",
          errors: err,
        });
      }

      conn.query(
        "INSERT INTO tipos_documento (nombre, _id, id_area) VALUES ?",
        [tipos],
        (err, tipos) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al crear tipo de documento",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            Area: area[0],
            Tipos_documento: tipos[0],
          });
        }
      );
    });
  });
});

//===================================
// Buscar area y tipos a partir de un documento
//===================================
app.get("/documento/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT A._id as id_area, A.nombre as nombre_area, T._id id_tipo, T.nombre as nombre_tipo " +
    "FROM AREAS AS A " +
    "LEFT JOIN tipos_documento as T ON A._id = T.id_area " +
    "LEFT JOIN CAJAS AS C ON C.id_empresa = A.id_empresa " +
    "LEFT JOIN DOCUMENTOS AS DC ON DC.id_caja = C._id " +
    "WHERE DC._id = ? ";

  // SELECT A._id as id_area, A.nombre as nombre_area, T._id id_tipo, T.nombre as nombre_tipo,
  // FROM AREAS AS A
  // LEFT JOIN tipos_documento as T ON A._id = T.id_area
  // LEFT JOIN CAJAS AS C ON C.id_empresa = A.id_empresa
  // LEFT JOIN DOCUMENTOS AS DC ON DC.id_caja = C._id
  // WHERE DC._id = 'x5cyw9p0jxc651t5'

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(consulta, [id], (err, area) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!area[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "El area no existe",
          errors: { message: "El area no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        area: area,
      });
    });
  });
});

//===================================
// Buscar area y tipos
//===================================
app.get("/areaytipos/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT A._id as id_area, A.nombre as nombre_area, T._id id_tipo, T.nombre as nombre_tipo " +
    "FROM AREAS AS A " +
    "LEFT JOIN tipos_documento as T ON A._id = T.id_area " +
    "WHERE A._id = ? ";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    // conn.query('SELECT a._id as id_area, a.nombre as nombre_area, t._id id_tipo, t.nombre as nombre_tipo  FROM areas as a LEFT JOIN tipos_documento as t ON a._id = t.id_area WHERE a.id_empresa = ?', [id], (err, area) => {
    conn.query(consulta, [id], (err, area) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!area[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "El area no existe",
          errors: { message: "El area no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        area: area,
      });
    });
  });
});

//===================================
// Buscar area y tipos por empresa.
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

    // conn.query('SELECT a._id as id_area, a.nombre as nombre_area, t._id id_tipo, t.nombre as nombre_tipo  FROM areas as a LEFT JOIN tipos_documento as t ON a._id = t.id_area WHERE a.id_empresa = ?', [id], (err, area) => {
    conn.query(
      "SELECT a._id as id_area, a.nombre as nombre_area, t._id id_tipo, t.nombre as nombre_tipo  FROM areas as a LEFT JOIN tipos_documento as t ON a._id = t.id_area WHERE a.id_empresa = ?",
      [id],
      (err, area) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!area[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "El area no existe",
            errors: { message: "El area no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          area: area,
        });
      }
    );
  });
});

//===================================
// Actualizar area y tipos de documento
//===================================
app.put("/modificarseccion/:id", (req, res) => {
  var tipos = [];
  var m_area = [];

  var cantidad = 0;

  var body = req.body;

  for (let j in body) {
    if (j != 0) {
      let m = {
        nombre: body[j].nombre,
        _id: body[j]._id,
      };
      tipos.push(Object.values(m));
    } else {
      let n = {
        nombre: body[j].nombre,
        _id: body[j]._id,
      };
      m_area.push(n);
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

    conn.query(
      "UPDATE areas set nombre = ? WHERE _id = ?",
      [m_area[0].nombre, m_area[0]._id],
      (err, area) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar area",
            errors: err,
          });
        }

        if (tipos.length != 0) {
          cantidad = tipos.length;

          tipos.forEach(function (item) {
            conn.query(
              "UPDATE tipos_documento set nombre = ? WHERE _id = ?",
              [item[0], item[1]],
              (err, tipodoc) => {
                if (err) {
                  return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar tipo de documento",
                    errors: err,
                  });
                }
                console.log(tipodoc);
              }
            );
            cantidad--;
          });

          if (cantidad == 0) {
            return res.status(200).json({
              ok: true,
              mensaje: "Area y tipos de documento actualizados",
            });
          }
        } else {
          return res.status(200).json({
            ok: true,
            mensaje: "Area actualizada",
          });
        }
      }
    );
  });
});

//======================================================================
// Actualizar area, tipos de documento y agregar tipos de documento
//======================================================================
app.put("/modificaragregarseccion/:id", (req, res) => {
  var tipos = [];
  var tipos_nuevos = [];
  var m_area = [];

  var cantidad = 0;

  var body = req.body;

  for (let j in body[0]) {
    if (j != 0) {
      let m = {
        nombre: body[0][j].nombre,
        _id: body[0][j]._id,
      };
      tipos.push(Object.values(m));
    } else {
      let n = {
        nombre: body[0][j].nombre,
        _id: body[0][j]._id,
      };
      m_area.push(n);
    }
  }

  for (let j in body[1]) {
    let x = {
      nombre: body[1][j].nombre,
      id_area: body[0][0]._id,
      _id: uniqid(),
    };
    tipos_nuevos.push(Object.values(x));
  }

  // console.log(m_area);
  // console.log('----');
  // console.log(tipos);
  // console.log('----');
  // console.log(tipos_nuevos);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "UPDATE areas set nombre = ? WHERE _id = ?",
      [m_area[0].nombre, m_area[0]._id],
      (err, area) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar area",
            errors: err,
          });
        }

        conn.query(
          "INSERT INTO tipos_documento (nombre, id_area, _id) VALUES ?",
          [tipos_nuevos],
          (err, tipodoc) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: "Error al ingresar tipo de documento",
                errors: err,
              });
            }

            if (tipos.length != 0) {
              tipos.forEach(function (item) {
                conn.query(
                  "UPDATE tipos_documento set nombre = ? WHERE _id = ?",
                  [item[0], item[1]],
                  (err, tipodoc) => {
                    if (err) {
                      return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar tipo de documento",
                        errors: err,
                      });
                    }
                  }
                );
              });

              return res.status(200).json({
                ok: true,
                mensaje: "Area - tipos de documento actualizados y agregados",
              });
            } else {
              return res.status(200).json({
                ok: true,
                mensaje: "Area actualizada y tipos de documento agregados",
              });
            }
          }
        );
      }
    );
  });
});

module.exports = app;
