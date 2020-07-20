const express = require("express");
const uniqid = require("uniqid");
const mdAuthentication = require("../middleweres/authentication");
const app = express();

//===================================
//Obtener todas las empresas //// VER ERROR DE BD.
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
    conn.query("SELECT * FROM empresas", (err, empresas) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        empresas: empresas,
      });
    });
  });
});

//===================================
// Buscar empresa
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

    conn.query("SELECT * FROM empresas WHERE _id = ?", [id], (err, empresa) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error en la DB",
          errors: err,
        });
      }

      if (!empresa[0]) {
        return res.status(400).json({
          ok: true,
          mensaje: "La empresa no existe",
          errors: { message: "La empresa no existe" },
        });
      }

      return res.status(200).json({
        ok: true,
        empresa: empresa[0],
      });
    });
  });
});

//===================================
// Crear una nueva empresa
//===================================
app.post("/", (req, res) => {
  const data = req.body;
  data._id = uniqid();
  data.ingreso = new Date();

  console.log(data);

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO empresas set ?", [data], (err, empresaGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear empresa",
          errors: err,
        });
      }

      return res.status(201).json({
        ok: true,
        empresa: [data][0],
      });
    });
  });
});

app.put("/anular/:id", (req, res) => {
  var id = req.params.id;
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
      "UPDATE empresas set fecha_baja = ? WHERE _id = ?",
      [datetime, id],
      (err, empresaActualizada) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al anular empresa",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Empresa anulada",
        });
      }
    );
  });
});

//===================================
// Desanular empresa
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
      "UPDATE empresas set fecha_baja = null, id_usuario_baja = null WHERE _id = ?",
      [id],
      (err, caja) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "empresa reestablecida",
        });
      }
    );
  });
});

//===================================
// Buscar empresa por nombre
//===================================
app.get("/existe/:id", (req, res) => {
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
      "SELECT * FROM empresas WHERE nombre = ?",
      [id],
      (err, empresa) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!empresa[0]) {
          return res.status(400).json({
            ok: true,
            mensaje: "La empresa no existe",
            errors: { message: "La empresa no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          empresa: empresa[0],
        });
      }
    );
  });
});

//===================================
// Buscar empresa por email
//===================================
app.get("/existemail/:id", (req, res) => {
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
      "SELECT * FROM empresas WHERE mail = ?",
      [id],
      (err, empresa) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!empresa[0]) {
          return res.status(200).json({
            ok: true,
            mensaje: "La empresa no existe",
            errors: { message: "La empresa no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "La empresa ya existe",
          empresa: empresa[0],
        });
      }
    );
  });
});

//===================================
// Buscar empresa por nombre
//===================================
app.get("/existename/:id", (req, res) => {
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
      "SELECT * FROM empresas WHERE nombre = ?",
      [id],
      (err, empresa) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error en la DB",
            errors: err,
          });
        }

        if (!empresa[0]) {
          return res.status(200).json({
            ok: true,
            mensaje: "La empresa no existe",
            errors: { message: "La empresa no existe" },
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "La empresa ya existe",
          empresa: empresa[0],
        });
      }
    );
  });
});

//===================================
// Actualizar empresa
//===================================
app.put("/actualizaremp/:id", (req, res) => {
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
      "UPDATE empresas set ? WHERE _id = ?",
      [body, id],
      (err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar empresa",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "Empresa actualizada",
        });
      }
    );
  });
});

module.exports = app;
