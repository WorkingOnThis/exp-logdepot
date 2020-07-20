const express = require("express");
const uniqid = require("uniqid");
const mdAuthentication = require("../middleweres/authentication");
const app = express();

//===================================
// Crear un nuevo deposito
//===================================
app.post("/", (req, res) => {
  var lugares = [];

  const data = req.body;

  data[0]._id = uniqid();

  for (let j in data) {
    if (data[j] != data[0]) {
      data[j]._id = uniqid();
      data[j].id_estante = data[0]._id;
    }
    lugares.push(Object.values(data[j]));
  }

  lugares.shift();

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO estantes set ?", data[0], (err, estante) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear estante",
          errors: err,
        });
      }

      conn.query(
        "INSERT INTO lugares (nombre, estado, _id, id_estante) VALUES ?",
        [lugares],
        (err, lugares) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al crear lugares",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            Estante: estante[0],
            Lugares: lugares[0],
          });
        }
      );
    });
  });
});

//===================================
// Obtener todo de estanterias
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
    conn.query("SELECT * FROM estantes", (err, estantes) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200).json({
        ok: true,
        Estantes: estantes,
      });
    });
  });
});

//===================================
// Intercambiar lugares y cajas
//===================================
app.put("/intercambiar", (req, res) => {
  const data = req.body;

  var array1 = data[0];
  var array2 = data[1];

  var arrayfullgreen1 = [];
  var arrayfullgreen2 = [];
  var arraygreen = [];
  var arrayred = [];

  for (let i in data[0]) {
    if (array1[i].color == "#41ce5b" && array2[i].color == "#41ce5b") {
      arrayfullgreen1.push(array1[i]);
      arrayfullgreen2.push(array2[i]);
    }

    if (array1[i].color == "#41ce5b" && array2[i].color == "#ec6262") {
      arraygreen.push(array1[i]);
      arrayred.push(array2[i]);
    }

    if (array1[i].color == "#ec6262" && array2[i].color == "#41ce5b") {
      arraygreen.push(array2[i]);
      arrayred.push(array1[i]);
    }
  }

  // Variables para mixto
  var todos = "";
  var setearVacios = "";
  var intercambio = "";
  // Variables para verdes
  var intercVerdes = "";
  var todosVerdes = "";

  for (let l in arrayred) {
    setearVacios +=
      'when "' + arraygreen[l]._id + '" then "1fxfv7710jqemzzbf" ';
    intercambio +=
      'when "' + arraygreen[l]._id + '" then "' + arrayred[l]._id + '"';
    todos += "'" + arrayred[l]._id + "', ";
  }

  for (let l in arraygreen) {
    todos += "'" + arraygreen[l]._id + "', ";
  }

  // Van a existir duplicados en un momento //
  for (let m in arrayfullgreen1) {
    intercVerdes +=
      'when "' +
      arrayfullgreen1[m]._id +
      '" then "' +
      arrayfullgreen2[m]._id +
      '"';
    intercVerdes +=
      'when "' +
      arrayfullgreen2[m]._id +
      '" then "' +
      arrayfullgreen1[m]._id +
      '"';
    todosVerdes +=
      "'" + arrayfullgreen1[m]._id + "', '" + arrayfullgreen2[m]._id + "', ";
  }

  var todosplus = todos.substr(0, todos.length - 2);
  var todosVerdesplus = todosVerdes.substr(0, todosVerdes.length - 2);

  var consultaMixtos =
    "UPDATE cajas as c, lugares as l " +
    "SET " +
    "l.estado = CASE l._id " +
    setearVacios +
    "ELSE '1fxfv76sojrp12vdw' " +
    "END, " +
    "c.id_posicion = case c.id_posicion " +
    intercambio +
    "ELSE c.id_posicion " +
    "END " +
    "WHERE l._id IN (" +
    todosplus +
    ")";

  var consultaVerdes =
    "UPDATE cajas " +
    "SET " +
    "id_posicion = CASE id_posicion " +
    intercVerdes +
    "ELSE id_posicion " +
    "END " +
    "WHERE id_posicion IN (" +
    todosVerdesplus +
    ")";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    if (arraygreen.length != 0 && arrayfullgreen1.length == 0) {
      conn.query(consultaMixtos, (err, mixtos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al intercambiar mixto",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          Mixtos: mixtos[0],
          // Verdes: verdes[0]
        });
      });
    }

    if (arrayfullgreen1.length != 0 && arraygreen.length == 0) {
      conn.query(consultaVerdes, (err, verdes) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al intercambiar mixto",
            errors: err,
          });
        }

        return res.status(201).json({
          ok: true,
          // Mixtos: mixtos[0]
          Verdes: verdes[0],
        });
      });
    }

    if (arrayfullgreen1.length != 0 && arraygreen.length != 0) {
      conn.query(consultaMixtos, (err, mixtos) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al intercambiar mixtos",
            errors: err,
          });
        }

        conn.query(consultaVerdes, (err, verdes) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al intercambiar dos verdes",
              errors: err,
            });
          }

          return res.status(201).json({
            ok: true,
            Mixtos: mixtos[0],
            Verdes: verdes[0],
          });
        });
      });
    }
  });
});

module.exports = app;
