const express = require("express");
const uniqid = require("uniqid");
const app = express();

//===================================
// Obtener contenidos
//===================================
app.get("/", (req, res) => {
  var consulta =
    "SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha, " +
    "desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, E.nombre as empresa, D.id_codigo as etiqueta_doc, " +
    "IF(C.fecha_baja IS NULL AND D.fecha_baja IS NULL, 0, 1) as anulado, " +
    "IF(C.prestamo = 1 OR D.prestamo = 1, 1, 0) as prestamo " +
    "FROM contenidos as CNT " +
    "LEFT JOIN areas as AR ON AR._id = CNT.id_area " +
    "LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo " +
    "LEFT JOIN cajas as C ON CNT.id_caja = C._id " +
    "LEFT JOIN empresas as E ON E._id = C.id_empresa " +
    "LEFT JOIN documentos as D ON D._id = CNT.id_documento";

  // SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha,
  // desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, E.nombre as empresa, D.id_codigo as etiqueta_doc,
  // IF(C.fecha_baja IS NULL AND D.fecha_baja IS NULL, 0, 1) as anulado,
  // IF(C.prestamo = 0 OR D.prestamo = 0, 0, 1) as prestamo
  // FROM contenidos as CNT
  // LEFT JOIN areas as AR ON AR._id = CNT.id_area
  // LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo
  // LEFT JOIN cajas as C ON CNT.id_caja = C._id
  // LEFT JOIN empresas as E ON E._id = C.id_empresa
  // LEFT JOIN documentos as D ON D._id = CNT.id_documento

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, (err, contenidos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener contenidos",
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
// Obtener contenidos por id
//===================================
app.get("/individuales/:id", (req, res) => {
  var id = req.params.id;

  var consulta =
    "SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha, " +
    "desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, E.nombre as empresa, D.id_codigo as etiqueta_doc, " +
    "IF(C.fecha_baja IS NULL AND D.fecha_baja IS NULL, 0, 1) as anulado, " +
    "IF(C.prestamo = 1 OR D.prestamo = 1, 1, 0) as prestamo " +
    "FROM contenidos as CNT " +
    "LEFT JOIN areas as AR ON AR._id = CNT.id_area " +
    "LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo " +
    "LEFT JOIN cajas as C ON CNT.id_caja = C._id " +
    "LEFT JOIN empresas as E ON E._id = C.id_empresa " +
    "LEFT JOIN documentos as D ON D._id = CNT.id_documento " +
    'WHERE C.id_codigo = "' +
    id +
    '" OR D.id_codigo = ?';

  // ORIGINAL funcionando
  // SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha,
  // desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, E.nombre as empresa, D.id_codigo as etiqueta_doc,
  // IF(C.fecha_baja IS NULL AND D.fecha_baja IS NULL, 0, 1) as anulado,
  // IF(C.prestamo = 0 OR D.prestamo = 1, 1, 0) as prestamo
  // FROM contenidos as CNT
  // LEFT JOIN areas as AR ON AR._id = CNT.id_area
  // LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo
  // LEFT JOIN cajas as C ON CNT.id_caja = C._id
  // LEFT JOIN empresas as E ON E._id = C.id_empresa
  // LEFT JOIN documentos as D ON D._id = CNT.id_documento
  // WHERE C.id_codigo = ?

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
          mensaje: "Error al obtener contenidos",
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
// Obtener contenidos por id
//===================================
app.get("/cajasysecciones/:id", (req, res) => {
  var id = req.params.id;

  var consulta1 =
    "SELECT _id, id_codigo " + "FROM cajas " + "WHERE id_empresa = ?";

  var consulta2 =
    "SELECT A._id id_area, A.nombre nombre_area, D._id id_tipo, D.nombre nombre_tipo " +
    "FROM areas A " +
    "LEFT JOIN tipos_documento D ON D.id_area = A._id " +
    "WHERE id_empresa = ? " +
    "ORDER BY A.nombre ASC";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta1, [id], (err, cajas) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al obtener cajas",
          errors: err,
        });
      }

      conn.query(consulta2, [id], (err, secciones) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al obtener secciones",
            errors: err,
          });
        }

        return res.status(200).json({
          ok: true,
          cajas: cajas,
          secciones: secciones,
        });
      });
    });
  });
});

app.post("/importarcontenidos/", (req, res) => {
  const data = req.body;

  for (let j in data) {
    data[j]._id = uniqid();
  }

  var array = data.map(
    ({
      CONTENIDO,
      AREA,
      ["TIPO DE DOCUMENTO"]: TIPO,
      ["DESDE N°"]: DESDEN,
      ["HASTA N°"]: HASTAN,
      ["DESDE LETRA"]: DESDEL,
      ["HASTA LETRA"]: HASTAL,
      ["DESDE FECHA"]: DESDEF,
      ["HASTA FECHA"]: HASTAF,
      OBSERVACION,
      CAJA,
      _id,
    }) => [
      CONTENIDO,
      AREA,
      TIPO,
      DESDEN,
      HASTAN,
      DESDEL,
      HASTAL,
      DESDEF,
      HASTAF,
      OBSERVACION,
      CAJA,
      _id,
    ]
  );

  var consulta =
    "INSERT INTO contenidos (txt_contenido, id_area, id_tipo, desde_n, hasta_n, desde_letra, hasta_letra, desde_fecha, hasta_fecha, observacion, id_caja, _id) VALUES ?";

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    conn.query(consulta, [array], (err, cajas) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al agregar contenido",
          errors: err,
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: "Satisfactorio",
      });
    });
  });
});

// SELECT txt_contenido, AR.nombre as area, TD.nombre as tipodocumento, desde_n, hasta_n, desde_fecha, hasta_fecha,
// desde_letra, hasta_letra, observacion, C.id_codigo as etiqueta, E.nombre as empresa, D.id_codigo as etiqueta_doc,
// IF(C.fecha_baja IS NULL AND D.fecha_baja IS NULL, 0, 1) as anulado,
// IF(C.prestamo = 0 AND D.prestamo = 0, 0, 1) as prestamo
// FROM contenidos as CNT
// LEFT JOIN areas as AR ON AR._id = CNT.id_area
// LEFT JOIN tipos_documento as TD ON TD._id = CNT.id_tipo
// LEFT JOIN cajas as C ON CNT.id_caja = C._id
// LEFT JOIN empresas as E ON E._id = C.id_empresa
// LEFT JOIN documentos as D ON D._id = CNT.id_documento

module.exports = app;
