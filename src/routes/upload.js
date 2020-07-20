var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion

    var tiposValidos = ['empresas', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PNG', 'JPG', 'JPEG', 'GIF'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path

    var path = `./src/uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }

        subirPorTIpo(tipo, id, nombreArchivo, req, res);

    })

});

function subirPorTIpo(tipo, id, nombreArchivo, req, res) {

    if (tipo === 'usuarios') {

        req.getConnection((err, conn) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al conectar con la base de datos.',
                    error: err
                });
            }

            conn.query('SELECT img FROM usuarios WHERE _id = ?', [id], (err, usuario) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error en la DB',
                        errors: err
                    });
                }

                if (!usuario[0]) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'El usuario no existe' }
                    });
                }

                var pathViejo = './src/uploads/usuarios/' + usuario[0].img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                usuario.img = nombreArchivo;

                conn.query('UPDATE usuarios set img = ? WHERE _id = ?', [usuario.img, id], (err, usuarioActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuarioActualizado: { img: usuario.img }
                    });
                });

            });
        });
    }

    if (tipo === 'empresas') {

        req.getConnection((err, conn) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al conectar con la base de datos.',
                    error: err
                });
            }

            conn.query('SELECT img FROM empresas WHERE _id = ?', [id], (err, empresa) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error en la DB',
                        errors: err
                    });
                }

                if (!empresa[0]) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'La empresa seleccionada no existe',
                        errors: { message: 'La empresa no existe' }
                    });
                }

                var pathViejo = './src/uploads/empresas/' + empresa[0].img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                empresa.img = nombreArchivo;

                conn.query('UPDATE empresas set img = ? WHERE _id = ?', [empresa.img, id], (err, empresaActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de empresa actualizada',
                        empresaActualizado: { img: empresa.img }
                    });
                });

            });
        });
    }
}

module.exports = app;