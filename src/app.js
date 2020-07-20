const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require("mysql");
const myConnection = require("express-myconnection");
const bodyParser = require("body-parser");

// Importar rutas
const appRoutes = require("./routes/app");
const usuarioRoutes = require("./routes/usuario");
const empresaRoutes = require("./routes/empresa");
const loginRoutes = require("./routes/login");
const uploadRoutes = require("./routes/upload");
const imagenesRoutes = require("./routes/imagenes");
const seccionesRoutes = require("./routes/secciones");
const depositoRoutes = require("./routes/deposito");
const lugarRoutes = require("./routes/lugar");
const estadosRoutes = require("./routes/estados");
const cajaRoutes = require("./routes/caja");
const documentoRoutes = require("./routes/documento");
const etiquetaRoutes = require("./routes/etiqueta");
const tipocajaRoutes = require("./routes/tipo-caja");
const loteRoutes = require("./routes/lote");
const modalRoutes = require("./routes/modal-lugar");
const reciboRoutes = require("./routes/recibo");
const movimientoRoutes = require("./routes/movimiento");
const contenidoRoutes = require("./routes/contenido");

// settings
app.set("port", process.env.PORT || 3000);

// CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

// Middlewares
app.use(morgan("dev"));
app.use(
  myConnection(
    mysql,
    {
      host: process.env.NODE_MYSQL_HOST,
      user: process.env.NODE_MYSQL_USER,
      password: process.env.NODE_MYSQL_PASS,
      port: 3306,
      database: process.env.NODE_MYSQL_DB
    },
    "single"
  )
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Utilizar rutas
app.use("/contenido", contenidoRoutes);
app.use("/movimiento", movimientoRoutes);
app.use("/recibo", reciboRoutes);
app.use("/modal", modalRoutes);
app.use("/lote", loteRoutes);
app.use("/tipocaja", tipocajaRoutes);
app.use("/etiqueta", etiquetaRoutes);
app.use("/documento", documentoRoutes);
app.use("/caja", cajaRoutes);
app.use("/estados", estadosRoutes);
app.use("/lugar", lugarRoutes);
app.use("/deposito", depositoRoutes);
app.use("/secciones", seccionesRoutes);
app.use("/empresa", empresaRoutes);
app.use("/imagenes", imagenesRoutes);
app.use("/upload", uploadRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(app.get("port"), () => {
  console.log("Servidor en puerto 3000 ultimo");
});
