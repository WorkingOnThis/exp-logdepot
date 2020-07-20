var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

var app = express();

//===================================
//Obtener todos los usuarios
//===================================

app.post("/", (req, res) => {
  const body = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }
    console.log(body.email); //VER DE SACAR
    conn.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [body.email],
      (err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error al buscar usuario",
            error: err,
          });
        }
        console.log(usuarioDB); //VER DE SACAR
        if (!usuarioDB[0]) {
          return res.status(400).json({
            ok: false,
            mensaje: "Credenciales incorrectas",
          });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB[0].password)) {
          return res.status(400).json({
            ok: false,
            mensaje: "Credenciales incorrectas",
          });
        }

        //crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {}); //4 horas
        //var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas
        //ver jwt.io

        // Respuesta
        return res.status(200).json({
          ok: true,
          usuario: usuarioDB[0],
          token: token,
          id: usuarioDB[0]._id,
          menu: obtenerMenu(usuarioDB[0].role),
        });
      }
    );
  });
});

function obtenerMenu(ROLE) {
  menu = [
    {
      titulo: "Inicio",
      icono: "fas fa-home",
      submenu: [{ titulo: "Principal", url: "/dashboard" }],
    },
    // {
    //     titulo: 'Mensajeria',
    //     icono: 'fas fa-envelope',
    //     submenu: [
    //         { titulo: 'Solicitudes', url: '/register' }
    //     ]
    // },
  ];

  if (ROLE === "ROLE_ADMIN") {
    // menu.push({ titulo: 'Rutas', icono: 'fas fa-route', submenu: [{ titulo: 'Listado de rutas', url: '/rutas/listar-rutas' }, { titulo: 'Nueva ruta', url: '/rutas/agregar-ruta' }] });
    // menu.push({ titulo: 'Areas', icono: 'far fa-newspaper', submenu: [{ titulo: 'Areas y tipos', url: '/areas' }] });
    // menu.push({ titulo: 'Etiquetas', icono: 'fas fa-barcode', submenu: [{ titulo: 'Para cajas', url: '/etiquetas/etiquetas-cajas' }, { titulo: 'Para documentos', url: '/etiquetas/etiquetas-documentos' }, { titulo: 'Listado de etiquetas', url: '/etiquetas/listar-etiquetas' }] });
    // menu.push({ titulo: 'Tipos de caja', icono: 'fas fa-tags', submenu: [{ titulo: 'Establecer tipos', url: '/tipos-de-caja' }] });
    // menu.push({ titulo: 'Estados', icono: 'fas fa-list-ul', submenu: [{ titulo: 'Configurar estados', url: '/estados' }] });

    menu.push({
      titulo: "Recibos",
      icono: "fas fa-window-restore",
      submenu: [
        { titulo: "Listado de recibos", url: "/recibos/listar-recibos" },
        { titulo: "Nuevo recibo", url: "/recibos/agregar-recibo" },
      ],
    });
    menu.push({
      titulo: "Etiquetas",
      icono: "fas fa-barcode",
      submenu: [
        {
          titulo: "Creación de etiquetas",
          url: "/etiquetas/etiquetas-generar",
        },
        { titulo: "Tabla de lotes", url: "/etiquetas/etiquetas-lotes" },
        {
          titulo: "Tabla de individuales",
          url: "/etiquetas/etiquetas-individuales",
        },
      ],
    });
    menu.push({
      titulo: "Movimientos",
      icono: "fas fa-exchange-alt",
      submenu: [
        {
          titulo: "Generar movimientos",
          url: "/movimientos/movimientos-generar",
        },
        {
          titulo: "Tabla de movimientos",
          url: "/movimientos/tabla-movimientos",
        },
      ],
    });
    menu.push({
      titulo: "Mantenimiento",
      icono: "fas fa-cog",
      submenu: [
        { titulo: "Usuarios", url: "/usuarios" },
        { titulo: "Empresas", url: "/empresas" },
        { titulo: "Cajas", url: "/cajas" },
        { titulo: "Documentos", url: "/documentos" },
      ],
    });
    menu.push({
      titulo: "Ubicaciones",
      icono: "fas fa-map-marked-alt",
      submenu: [
        { titulo: "Configurar deposito", url: "/deposito/configurar-deposito" },
        { titulo: "Posicionar cajas", url: "/deposito/posicionar-cajas" },
      ],
    });
    menu.push({
      titulo: "Contenidos",
      icono: "fas fa-file-upload",
      submenu: [
        { titulo: "Tabla de contenidos", url: "/contenidos/tabla-contenidos" },
      ],
    });
  }

  return menu;
}

module.exports = app;
