var express = require("express");
const nodemailer = require("nodemailer");
const uniqid = require("uniqid");
var app = express();

//===================================
// Crear una nueva empresa
//===================================
app.post("/", (req, res) => {
  var renglones = [];

  const data = req.body;

  data._id = uniqid();

  for (let j in data.renglones) {
    data.renglones[j]._id = uniqid();
    data.renglones[j].id_recibo = data._id;
    renglones.push(Object.values(data.renglones[j]));
  }

  delete data.renglones;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al conectar con la base de datos.",
        error: err,
      });
    }

    conn.query("INSERT INTO recibos set ?", data, (err, recibo) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al crear recibo",
          errors: err,
        });
      }

      conn.query(
        "INSERT INTO renglones (select_accion, select_unidad, codigo, estado, id_recibo, _id, fecha_baja, usuario_baja) VALUES ?",
        [renglones],
        (err, renglon) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al crear renglon",
              errors: err,
            });
          }

          if (data.enviar_email) {
            data.renglones = renglones;

            sendMail(data, (info) => {
              // res.send(info);
              return res.status(201).json({
                ok: true,
                Recibo: recibo,
                Renglones: renglon,
                email_info: info,
              });
            });
          } else {
            return res.status(201).json({
              ok: true,
              Recibo: recibo,
              Renglones: renglon,
              // email_info: respuesta
            });
          }
        }
      );
    });
  });
});

//===================================
// Obtener todas los recibos para listado
//===================================

app.get("/", (req, res) => {
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
      "SELECT r._id, r.nombre_empresa, r.razon_social, r.direccion, r.telefono, r.responsable, r.email, r.envio, r.fecha, r.firma_nombre, r.firma_apellido, r.firma, r.id_empresa, r.observaciones, r.enviar_email, r.fecha_creacion, CONCAT(u.nombre , ' ' , u.apellido) as usuario_creacion, r.fecha_baja, CONCAT(u.nombre , ' ' , u.apellido) as usuario_baja FROM recibos as r LEFT JOIN usuarios as u ON u._id = r.usuario_creacion or u._id = r.usuario_baja",
      (err, recibos) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          recibos: recibos,
        });
        console.log(recibos[0]);
      }
    );
  });
});

//===================================
// Obtener Recibo en particular
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
    // conn.query("SELECT * FROM recibos WHERE fecha_baja IS NULL or fecha_baja = ''", (err, recibos) => {
    conn.query(
      "SELECT r._id, r.nombre_empresa, r.razon_social, r.direccion, r.telefono, r.responsable, r.email, r.envio, r.fecha, r.firma_nombre, r.firma_apellido, r.firma, r.id_empresa, r.observaciones, r.enviar_email, r.fecha_creacion, CONCAT(u.nombre , ' ' , u.apellido) as usuario_creacion, r.fecha_baja, CONCAT(u.nombre , ' ' , u.apellido) as usuario_baja FROM recibos as r LEFT JOIN usuarios as u ON u._id = r.usuario_creacion or u._id = r.usuario_baja WHERE r._id = ?",
      [id],
      (err, recibo) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          recibo: recibo[0],
        });
      }
    );
  });
});

//===================================
// Obtener Recibo en particular
//===================================

app.get("/renglones/:id", (req, res) => {
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
      "SELECT * FROM renglones WHERE id_recibo = ?",
      [id],
      (err, renglones) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          renglones: renglones,
        });
      }
    );
  });
});

//===================================
// Obtener Recibo en particular
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
      "UPDATE recibos set fecha_baja = null, usuario_baja = null WHERE _id = ?",
      [id],
      (err, recibo) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "recibo reestablecido",
        });
      }
    );
  });
});

//===================================
// Actualizar recibo con email y observacion
//===================================

app.put("/:id", (req, res) => {
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
      "UPDATE recibos set ? WHERE _id = ?",
      [body, id],
      (err, recibo) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "recibo modificado",
        });
      }
    );
  });
});

//===================================
// Eliminar Recibo
//===================================

app.delete("/:id", (req, res) => {
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
      "DELETE r, ren FROM recibos as r INNER JOIN renglones as ren WHERE r._id = ren.id_recibo AND r._id = ?",
      [id],
      (err, recibo) => {
        if (err) {
          return res.json(err);
        }
        return res.status(200).json({
          ok: true,
          mensaje: "recibo eliminado",
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
      "UPDATE recibos set fecha_baja = ?, usuario_baja = ? WHERE _id = ?",
      [datetime, body.usuario_baja, id],
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
          mensaje: "recibo actualizado",
        });
      }
    );
  });
});

async function sendMail(data, callback) {
  var renglones_entrega = [];
  var renglones_recibo = [];

  for (let j in data.renglones) {
    if (data.renglones[j].select_accion == "entrega") {
      renglones_entrega.push(Object.values(data.renglones[j]));
    } else {
      renglones_recibo.push(Object.values(data.renglones[j]));
    }
  }

  data.fecha = data.fecha.split(" ")[0];

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODE_GMAIL_ACCOUNT,
      pass: process.env.NODE_GMAIL_PASS
    },
  });

  let mailOptions = {
    from: '"Logdepot"<aulitadehistoria@gmail.com>', // sender address
    to: `${data.email}`, // list of receivers   data.email
    subject: "Informe de recibo.", // Subject line
    // html: `<h1>Empresa: ${data.nombre_empresa}</h1><br>`
    html: `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="utf-8"> <!-- utf-8 works for most cases -->
            <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
            <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
            <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
            <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        
            <!-- Web Font / @font-face : BEGIN -->
            <!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->
        
            <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
            <!--[if mso]>
                <style>
                    * {
                        font-family: sans-serif !important;
                    }
                </style>
            <![endif]-->
        
            <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
            <!--[if !mso]><!-->
            <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
            <!--<![endif]-->
        
            <!-- Web Font / @font-face : END -->
        
            <!-- CSS Reset : BEGIN -->
            <style>
        
                /* What it does: Remove spaces around the email design added by some email clients. */
                /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                html,
                body {
                    margin: 0 auto !important;
                    padding: 0 !important;
                    height: 100% !important;
                    width: 100% !important;
                }
        
                /* What it does: Stops email clients resizing small text. */
                * {
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                }
        
                /* What it does: Centers email on Android 4.4 */
                div[style*="margin: 16px 0"] {
                    margin: 0 !important;
                }
        
                /* What it does: Stops Outlook from adding extra spacing to tables. */
                table,
                td {
                    mso-table-lspace: 0pt !important;
                    mso-table-rspace: 0pt !important;
                }
        
                /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
                table {
                    border-spacing: 0 !important;
                    border-collapse: collapse !important;
                    table-layout: fixed !important;
                    margin: 0 auto !important;
                }
                table table table {
                    table-layout: auto;
                }
        
                /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
                a {
                    text-decoration: none;
                }
        
                /* What it does: Uses a better rendering method when resizing images in IE. */
                img {
                    -ms-interpolation-mode:bicubic;
                }
        
                /* What it does: A work-around for email clients meddling in triggered links. */
                *[x-apple-data-detectors],  /* iOS */
                .unstyle-auto-detected-links *,
                .aBn {
                    border-bottom: 0 !important;
                    cursor: default !important;
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }
        
                /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
                .a6S {
                   display: none !important;
                   opacity: 0.01 !important;
               }
               /* If the above doesn't work, add a .g-img class to any image in question. */
               img.g-img + div {
                   display: none !important;
               }
        
                /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
                /* Create one of these media queries for each additional viewport size you'd like to fix */
        
                /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
                @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                    .email-container {
                        min-width: 320px !important;
                    }
                }
                /* iPhone 6, 6S, 7, 8, and X */
                @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                    .email-container {
                        min-width: 375px !important;
                    }
                }
                /* iPhone 6+, 7+, and 8+ */
                @media only screen and (min-device-width: 414px) {
                    .email-container {
                        min-width: 414px !important;
                    }
                }
        
            </style>
            <!-- CSS Reset : END -->
            <!-- Reset list spacing because Outlook ignores much of our inline CSS. -->
            <!--[if mso]>
            <style type="text/css">
                ul,
                ol {
                    margin: 0 !important;
                }
                li {
                    margin-left: 30px !important;
                }
                li.list-item-first {
                    margin-top: 0 !important;
                }
                li.list-item-last {
                    margin-bottom: 10px !important;
                }
            </style>
            <![endif]-->
        
            <!-- Progressive Enhancements : BEGIN -->
            <style>
        
                /* What it does: Hover styles for buttons */
                .button-td,
                .button-a {
                    transition: all 100ms ease-in;
                }
                .button-td-primary:hover,
                .button-a-primary:hover {
                    background: #555555 !important;
                    border-color: #555555 !important;
                }
        
                /* Media Queries */
                @media screen and (max-width: 600px) {
        
                    .email-container {
                        width: 100% !important;
                        margin: auto !important;
                    }
        
                    /* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
                    .fluid {
                        max-width: 100% !important;
                        height: auto !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
        
                    /* What it does: Forces table cells into full-width rows. */
                    .stack-column,
                    .stack-column-center {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        direction: ltr !important;
                    }
                    /* And center justify these ones. */
                    .stack-column-center {
                        text-align: center !important;
                    }
        
                    /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
                    .center-on-narrow {
                        text-align: center !important;
                        display: block !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        float: none !important;
                    }
                    table.center-on-narrow {
                        display: inline-block !important;
                    }
        
                    /* What it does: Adjust typography on small screens to improve readability */
                    .email-container p {
                        font-size: 17px !important;
                    }
                }
        
            </style>
            <!-- Progressive Enhancements : END -->
        
            <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
            <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
        
        </head>
        <!--
            The email background color (#222222) is defined in three places:
            1. body tag: for most email clients
            2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
            3. mso conditional: For Windows 10 Mail
        -->
        <body width="100%" style="margin: 0; padding: 0px !important; mso-line-height-rule: exactly; background-color: #8f8e8e;">
            <center style="width: 100%; background-color: #8f8e8e;">
            <!--[if mso | IE]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #b82222;">
            <tr>
            <td>
            <![endif]-->
        
                <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
                <!-- Preview Text Spacing Hack : BEGIN -->
                <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
                    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
                </div>
                <!-- Preview Text Spacing Hack : END -->
        
                <!-- Email Body : BEGIN -->
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto;" class="email-container">
                    <br>
                    <br>
                                <!-- Thumbnail Left, Text Right : BEGIN -->
                    <tr>
                        <td dir="ltr" valign="top" width="100%" style="padding: 10px; background-image: url(https://i.ytimg.com/vi/_TVMVbTC0U0/maxresdefault.jpg); border-radius: 10px 10px 0px 0px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <!-- Column : BEGIN -->
                                    <td width="100%" class="stack-column-center" style="text-align: right">
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td dir="ltr" valign="top" style="padding: 0 10px;">
                                                    <img src="http://img.fenixzone.net/i/gz4YUwo.png" width="300" height="140" alt="alt_text" border="0" style="height: auto; color: #555555;">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Column : END -->
                                    <!-- Column : BEGIN -->
                                    <!-- Column : END -->
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Thumbnail Left, Text Right : END -->
                    <!-- 1 Column Text + Button : BEGIN -->
                    <tr>
                        <td style="background-color: #ffffff;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <br>
                                <tr>
                                <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                                    <h1 style="margin: 0 0 10px; font-size: 25px; line-height: 30px; color: #333333; font-weight: normal;">Estimado cliente</h1>
                                    <p style="margin: 0 0 10px;">Le informamos que el dia ${data.fecha} se efectuó: </p>
                                    <ul style="padding: 0; margin-top: 100px; list-style-type: disc;">
                                    </ul>
                                    
                                </td>
                                </tr>
            <!-- Clear Spacer : BEGIN -->
            <tr>
                <td style="padding-left: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                    &nbsp;
                    <p style="margin: 0 0 10px;">Recepcionista: ${data.firma_nombre} ${data.firma_apellido} </p>
                </td>
            </tr>
            <!-- Clear Spacer : END -->
                                </table>
                            </td>
                        </tr>
            <!-- 1 Column Text + Button : END -->
            <!-- Background Image with Text : BEGIN -->
            <tr>
                <!-- Bulletproof Background Images c/o https://backgrounds.cm -->
                <td valign="middle" style="text-align: center; background-color: black; background-color: #222222; background-position: center center !important; background-size: cover !important; border-radius: 0px 0px 10px 10px;">
                    <!--[if gte mso 9]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:175px; background-position: center center !important;">
                    <v:fill type="tile" src="https://via.placeholder.com/600x230/222222/666666" color="#222222" />
                    <v:textbox inset="0,0,0,0">
                    <![endif]-->
                    <div>
                        <!-- Email Footer : BEGIN -->
                        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto;" class="email-container">
                            <tr>
            
                                <td style="padding: 20px; font-family: sans-serif; font-size: 12px; line-height: 20px; text-align: center; color: #cccccc;">
                                    © Logdepot - 2019<br><span class="unstyle-auto-detected-links">Bv De Los Napolitanos 6095 Córdoba, Argentina<br>+54(351) 4751718 - 4864318</span><br>
                                    <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">www.logdepotsa.com.ar</webversion><br>
                                </td>
                            </tr>
                        </table>
            
                        <!-- Email Footer : END -->
                    </div>
                    <!--[if gte mso 9]>
                    </v:textbox>
                    </v:rect>
                    <![endif]-->
                </td>
            </tr>
            <!-- Background Image with Text : END -->
            <!-- Clear Spacer : BEGIN -->
            <tr>
                <td aria-hidden="true" height="40" style="font-size: 0px; line-height: 0px;">
                    &nbsp;
                </td>
            </tr>
            <!-- Clear Spacer : END -->
                    </table>
            <!-- Email Body : END -->
            <!--
                   <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto;" class="email-container">
                       <tr>
                           <td style="padding: 20px; font-family: sans-serif; font-size: 12px; line-height: 15px; text-align: center; color: #888888;">
                               <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">www.logdepotsa.com.ar</webversion>
                               <br><br>
                               Ypsilon<br><span class="unstyle-auto-detected-links">Bv De Los Napolitanos 6095 Córdoba, Argentina<br>+54(351) 4751718 - 4864318</span>
                           </td>
                       </tr>
                   </table>
            : END -->
            <!--[if mso | IE]>
            </td>
            </tr>
            </table>
            <![endif]-->
                </center>
            </body>
            </html>`,
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}

module.exports = app;
