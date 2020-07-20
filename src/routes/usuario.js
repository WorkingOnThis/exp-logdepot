const express = require("express");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const mdAuthentication = require("../middleweres/authentication");
const app = express();

//===================================
//Obtener todos los usuarios //// VER ERROR DE BD.
//===================================

app.get("/", (req, res, next) => {
  // var consulta = 'SELECT u._id, u.img, u.nombre, u.apellido, e.nombre as empresa, u.role, u.telefono, u.email, ' +
  // 'u.dni, u.fecha_creacion, u.fecha_baja, ' +
  // '(CASE WHEN u.id_creador IS NOT NULL THEN CONCAT(u.nombre , " " , u.apellido) END) as id_creador, ' +
  // '(CASE WHEN u.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja ' +
  // 'FROM usuarios AS u ' +
  // 'LEFT JOIN usuarios as us ON us._id = c.id_usuario_baja ' +
  // 'LEFT JOIN empresas AS e ON e._id = u.id_empresa';

  var consulta =
    "SELECT u._id, u.img, u.nombre, u.apellido, e.nombre as empresa, u.role, u.telefono, u.email, " +
    "u.dni, u.fecha_creacion, u.fecha_baja, " +
    '(CASE WHEN u.id_creador IS NOT NULL THEN CONCAT(ut.nombre , " " , ut.apellido) END) as id_creador, ' +
    '(CASE WHEN u.id_usuario_baja IS NOT NULL THEN CONCAT(us.nombre , " " , us.apellido) END) as id_usuario_baja ' +
    "FROM usuarios AS u " +
    "LEFT JOIN usuarios as us ON us._id = u.id_usuario_baja " +
    "LEFT JOIN usuarios as ut ON ut._id = u.id_creador " +
    "LEFT JOIN empresas AS e ON e._id = u.id_empresa";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, usuarios) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        usuarios: usuarios,
      });
    });
  });
});

//===================================
//Obtener empresas para crear usuario
//===================================

app.get("/listadoempresas", (req, res, next) => {
  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query("SELECT _id, nombre FROM empresas", (err, listaodempresas) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        listaodempresas: listaodempresas,
      });
    });
  });
});

//===================================
// Crear un nuevo usuario
//===================================
app.post("/", (req, res) => {
  const data = req.body;
  data.password = bcrypt.hashSync(data.password, 10);
  data._id = uniqid();
  data.fecha_creacion = new Date();

  console.log(data);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO usuarios set ?", [data], (err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear usuario",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        usuario: [data][0],
        usuarioToken: req.usuario,
      });
    });
  });
});

//===================================
// Borrar un nuevo usuario por el id
//===================================
app.delete("/:id", mdAuthentication.verificaToken, (req, res) => {
  var { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query(
      "DELETE FROM usuarios WHERE _id = ?",
      [id],
      (err, usuarioEliminado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al eliminar usuario",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          usuario: usuarioEliminado,
          usuarioToken: req.usuario,
        });
      }
    );
  });
});

//===================================
// Actualizar usuario con imagen
//===================================
app.put("/:id", mdAuthentication.verificaToken, (req, res) => {
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
      "SELECT img FROM usuarios WHERE _id = ?",
      [id],
      (err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!usuario[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "Usuario no existe",
            errors: { message: "El usuario no existe" },
          });
        }

        conn.query(
          "UPDATE usuarios set ? WHERE _id = ?",
          [body, id],
          (err, usuarioActualizado) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: "Error al actualizar usuario",
                errors: err,
              });
            }

            return res.status(200).json({
              ok: true,
              mensaje: "Usuario actualizado",
            });
          }
        );
      }
    );
  });
});

//===================================
// Actualizar usuario
//===================================
app.put("/actualizarusr/:id", (req, res) => {
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
      "UPDATE usuarios set ? WHERE _id = ?",
      [body, id],
      (err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar usuario",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Usuario actualizado",
        });
      }
    );
  });
});

//===================================
// Buscar usuario
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

    conn.query("SELECT * FROM usuarios WHERE _id = ?", [id], (err, usuario) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!usuario[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "Usuario no existe",
          errors: { message: "El usuario no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        usuario: usuario[0],
      });
    });
  });
});

//===================================
// Buscar usuarios por empresa
//===================================
app.get("/usuariosporempresa/:id", (req, res) => {
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
      "SELECT _id, nombre, apellido FROM usuarios WHERE id_empresa = ?",
      [id],
      (err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!usuario[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "Usuario no existe",
            errors: { message: "El usuario no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          usuario: usuario,
        });
      }
    );
  });
});

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
      "UPDATE usuarios set fecha_baja = ?, id_usuario_baja = ? WHERE _id = ?",
      [datetime, body.id_usuario_baja, id],
      (err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar usuario",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Usuario actualizado",
        });
      }
    );
  });
});

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

    conn.query(
      "UPDATE usuarios set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar usuario",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Usuario actualizado",
        });
      }
    );
  });
});

//===================================
// Buscar usuario por email
//===================================
app.get("/existemail/:id", (req, res) => {
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
      "SELECT * FROM usuarios WHERE email = ?",
      [id],
      (err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!usuario[0]) {
          return res.status(200).json({
            ok: true,
            mensaje: "El usuario no existe",
            errors: { message: "El usuario no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "El usuario ya existe",
          usuario: usuario[0],
        });
      }
    );
  });
});

module.exports = app;
