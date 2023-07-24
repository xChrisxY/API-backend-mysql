const express = require('express')
const routes = express.Router()
// const bodyParser = require('body-parser');

// routes.use(bodyParser.urlencoded({ extended: true }));
// routes.use(bodyParser.json());

// Registramos un nuevo usuario
routes.post('/login', (req, res) => {

    const { username, password } = req.body;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM empleado where usuario = ? AND contrasena = ?', [username, password], (error, rows) => {

            if (error) {

                res.send(error);

            } else {

                res.send(rows)

            }

        })

    })

});

routes.post('/modificarPassword', (req, res) => {

    const { contrasenaActual, nuevaContrasena, idEmpleado } = req.body;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM empleado where contrasena = ? AND idEmpleado = ?', [contrasenaActual, idEmpleado], (error, rows) => {

            if (error) {

                res.send(error);

            } else {

                if (rows.length === 0) {

                    return res.status(400).json({ message: 'Contraseña actual incorrecta' });

                }

            }

            connect.query('UPDATE empleado set contrasena = ? WHERE contrasena = ?', [nuevaContrasena, contrasenaActual], (error, rows) => {

                if (error) {

                    res.send(error);

                } else {

                    res.status(200).json({ message: 'Contraseña actualizada correctamente' });

                }

            })

        })

    })

});


routes.get('/cliente/:idEmpleado', (req, res) => {

    const idEmpleado = req.params.idEmpleado;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM cliente where idEmpleado = ? AND estatus = "activo"', [idEmpleado], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});




//Este es para comprobar si un empleado tiene clientes por cobrar
routes.get('/gestorClientes/:idEmpleado', (req, res) => {

    const idEmpleado = req.params.idEmpleado;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM cliente where idEmpleado = ?', [idEmpleado], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});


// modificamos la tabla cliente, especificamente el atributo pendiente o eliminamos
routes.put('/agregarCliente', (req, res) => {

    const { estatus, curp } = req.body;

    const values = [estatus, curp];


    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE cliente set estatus = ? WHERE curp = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Cliente agregado');

        })

    })

});

routes.put('/finiquitarCliente', (req, res) => {

    const { estatus, curp } = req.body;

    const values = [estatus, curp];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE cliente set estatus = ? WHERE curp = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Cliente finiquitado');

        })

    })

});


routes.put('/iniciarCredito', (req, res) => {

    const { fechaInicio, fechaTermino, idCredito } = req.body;

    const values = [fechaInicio, fechaTermino, idCredito];

    console.log(values);

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE credito set fechaInicio = ?, fechaTermino = ? WHERE idCredito = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('El credito se ha iniciado');

        })

    })

});


routes.get('/credito/:curp', (req, res) => {

    const curp = req.params.curp;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM credito WHERE curp = ?', [curp], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

})

routes.get('/pago/:idCredito', (req, res) => {

    const idCredito = req.params.idCredito;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT * FROM pago WHERE idCredito = ?', [idCredito], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

})


routes.get('/sucursal/:idSucursal', (req, res) => {

    const idSucursal = req.params.idSucursal;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT ubicacion, direccion FROM sucursal WHERE idSucursal = ?', [idSucursal], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});

routes.get('/cobradosDia', (req, res) => {

    const { idEmpleado, fecha } = req.query;

    const values = [idEmpleado, fecha];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('SELECT c.nombre, p.fecha, p.monto, p.hora FROM cliente AS c NATURAL JOIN credito NATURAL JOIN pago AS p WHERE c.idEmpleado = ? and p.fecha = ?;', values, (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});

routes.get('/actualizar/:curp', (req, res) => {

    const curp = req.params.curp;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query(`SELECT 
        c.nombre, c.apellidoPaterno, c.apellidoMaterno ,c.fechaNacimiento, c.telefono, c.email, c.calle, c.colonia, c.numeroCasa, c.rfc, c.curp, c.estadoCivil,
        rp.idReferencia, 
        rp.nombreParentesco, rp.parentesco, rp.direccionParentesco, rp.telefonoParentesco, 
        rl.nombreEmpresa, rl.salario, rl.telefonoEmpresa, rl.direccionEmpresa, rl.puesto,
        rc.buroCredito, rc.creditoActual, rc.importeCredito,
        rb.tarjetaCredito, rb.tarjetaDebito, rb.cuentaBancaria
    FROM
        cliente AS c
        JOIN referenciaPersonal AS rp ON c.curp = rp.curp
        JOIN referenciaLaboral AS rl ON c.curp = rl.curp
        JOIN refenciaCrediticia AS rc ON c.curp = rc.curp
        JOIN referenciaBancaria AS rb ON c.curp = rb.curp
    WHERE
        c.curp = ?
        AND rp.curp = ?
        AND rl.curp = ?
        AND rc.curp = ?
        AND rb.curp = ?;`, [curp, curp, curp, curp, curp], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});


routes.get('/solicitud', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = `SELECT 
        cliente.nombre, cliente.apellidoPaterno, cliente.apellidoMaterno, cliente.curp, empleado.nombre AS nombre_empleado, cliente.idEmpleado, 
        cliente.telefono, cliente.email, cliente.colonia , cliente.calle, cliente.numeroCasa ,credito.totalCredito, credito.plan, 
        credito.pagos, credito.idCredito, referenciaLaboral.salario, refenciaCrediticia.buroCredito,
        refenciaCrediticia.creditoActual, refenciaCrediticia.importeCredito, refenciaCrediticia.idReferencia
    FROM 
        cliente
    NATURAL JOIN 
        credito
    NATURAL JOIN 
        referenciaLaboral
    INNER JOIN
        refenciaCrediticia
    JOIN 
        empleado 
    ON 
        cliente.idEmpleado = empleado.idEmpleado
    WHERE 
        cliente.curp = credito.curp 
    AND 
        cliente.curp = referenciaLaboral.curp 
    AND
        cliente.curp = refenciaCrediticia.curp
    AND 
        cliente.estatus = 'pendiente' 
    AND 
        cliente.buroCredito = 'limpio';`;

        connect.query(query, (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});

//Obtenemos todos los empleados según la sucursal del administrador

routes.get('/gestores/:idSucursal', (req, res) => {

    const idSucursal = req.params.idSucursal;

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(idSucursal)

        connect.query('SELECT * FROM empleado where IdSucursal = ? AND puesto = "Gestor de cobranza"', [idSucursal], (error, rows) => {

            if (error) return res.send(error);

            res.json(rows);

        })

    })

});

routes.post('/pago', (req, res) => {

    const { idCredito, fecha, hora, monto, saldoRestante } = req.body;

    const values = {idCredito, fecha, hora, monto};

    req.getConnection((error, connect) => {

        if (error) return res.send(error)

        connect.query('SELECT pagos FROM credito WHERE idCredito = ?', [idCredito], (error, rows) => {

            if (error) return res.send(error);

            if (rows.length === 0) {

                return res.send('No se encontró el crédito');

            }

            const montoDiario = rows[0].pagos;
            const finiquitado = saldoRestante - monto;

            console.log(montoDiario)
            console.log(finiquitado);
            console.log(monto);


            if ((monto < montoDiario) && finiquitado === 0) {

                console.log("1")

                connect.query('INSERT INTO pago SET ?', [values], (error, rows) => {

                    if (error) return res.send(error);

                    res.send('FINIQUITADO');

                })

            } else if (monto > montoDiario && finiquitado === 0) {

                console.log("2")

                connect.query('INSERT INTO pago SET ?', [values], (error, rows) => {

                    if (error) return res.send(error);

                    res.send('FINIQUITADO');

                })

            } else if (monto >= montoDiario && finiquitado > 0) {

                console.log("3")

                connect.query('INSERT INTO pago SET ?', [values], (error, rows) => {

                    if (error) return res.send(error);

                    res.send('CORRECTO');

                })

            } else if ((monto < montoDiario) && (finiquitado > 0)) {

                console.log("4")

                res.send('ERROR');

            }

        })

    })

})

//aqui se está agregando a un nuevo cliente
routes.post('/', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('INSERT INTO cliente set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('cliente agregado');
        })

    })

})

routes.post('/referencia1', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO referenciaPersonal set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencias Personales correctamente insertadas');
        })

    })

})

routes.post('/referencia2', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO referenciaLaboral set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencias Laborales correctamente insertadas');
        })

    })

})

routes.post('/referencia3', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO refenciaCrediticia set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencias crediticias correctamente insertadas');
        })

    })

})

routes.post('/referencia4', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO referenciaBancaria set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencias crediticias correctamente insertadas');
        })

    })

})

routes.post('/credito', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO credito set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Información del credito registrado');
        })

    })

});

routes.post('/empleado', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('INSERT INTO empleado set ?', [req.body], (error, rows) => {

            if (error) return res.send(error);

            res.send('Información del credito registrado');
        })

    })

});


routes.delete('/:idEmpleado', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        console.log(req.body)

        connect.query('DELETE FROM empleado WHERE idEmpleado = ?', [req.params.idEmpleado], (error, rows) => {

            if (error) return res.send(error);

            res.send('Empleado eliminado');
        })

    })

});
// En esta sección vamos a eliminar las 5 tablas con toda la información del cliente en caso de que
// su solicitud haya sido rechazada

routes.delete('/eliminarCliente/:curp', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM cliente WHERE curp = ?', [req.params.curp], (error, rows) => {

            if (error) return res.send(error);

            res.send('Cliente eliminado');
        })

    })

});

// Eliminamos las 4 referencias
routes.delete('/eliminarReferencia1/:idReferencia', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM referenciaPersonal WHERE idReferencia = ?', [req.params.idReferencia], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia eliminada');
        })

    })

});

routes.delete('/eliminarReferencia2/:idReferencia', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM referenciaLaboral WHERE idReferencia = ?', [req.params.idReferencia], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia eliminada');
        })

    })

});

routes.delete('/eliminarReferencia3/:idReferencia', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM refenciaCrediticia WHERE idReferencia = ?', [req.params.idReferencia], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia eliminada');
        })

    })

});

routes.delete('/eliminarReferencia4/:idReferencia', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM referenciaBancaria WHERE idReferencia = ?', [req.params.idReferencia], (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia eliminada');
        })

    })

});

// Eliminamos también la información de su credito
routes.delete('/eliminarCredito/:idCredito', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM credito WHERE idCredito = ?', [req.params.idCredito], (error, rows) => {

            if (error) return res.send(error);

            res.send('Información del crédito eliminada');
        })

    })

});

//Eliminamos a un gestor que ya no tenga pendientes
routes.delete('/eliminarGestor/:idEmpleado', (req, res) => {

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        connect.query('DELETE FROM empleado WHERE idEmpleado = ?', [req.params.idEmpleado], (error, rows) => {

            if (error) return res.send(error);

            res.send('El empleado ha sido eliminado');

        })

    })

});


routes.put('/modificarCliente', (req, res) => {

    const { curp, nombre, apellidoPaterno, apellidoMaterno, email, colonia, calle, numeroCasa, telefono, estadoCivil, rfc, estatus, fechaNacimiento } = req.body;

    const values = [nombre, apellidoPaterno, apellidoMaterno, email, colonia, calle, numeroCasa, telefono, estadoCivil, rfc, estatus, fechaNacimiento, curp]

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE cliente set nombre = ?, apellidoPaterno = ?, apellidoMaterno = ?, email = ?, colonia = ? , calle = ?, numeroCasa = ? ,    telefono = ?, estadoCivil = ?, rfc = ?, estatus = ?, fechaNacimiento = ?  WHERE curp = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Cliente actualizado');
        })

    })

});

routes.put('/modificarReferencia1', (req, res) => {

    const { idReferencia, nombreParentesco, parentesco, direccionParentesco, telefonoParentesco } = req.body;

    const values = [nombreParentesco, parentesco, direccionParentesco, telefonoParentesco, idReferencia];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE referenciaPersonal set nombreParentesco = ?, parentesco = ?, direccionParentesco = ?, telefonoParentesco = ? WHERE idReferencia = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia Personal actualizada');

        })

    })

});

routes.put('/modificarReferencia2', (req, res) => {

    const { idReferencia, nombreEmpresa, salario, telefonoEmpresa, direccionEmpresa, puesto } = req.body;

    const values = [nombreEmpresa, salario, telefonoEmpresa, direccionEmpresa, puesto, idReferencia]

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE referenciaLaboral set nombreEmpresa = ?, salario = ?, telefonoEmpresa = ?, direccionEmpresa = ?, puesto = ? WHERE idReferencia = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia Personal actualizada');

        })

    })

});

routes.put('/modificarReferencia3', (req, res) => {

    const { idReferencia, buroCredito, creditoActual, importeCredito } = req.body;

    const values = [buroCredito, creditoActual, importeCredito, idReferencia];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE refenciaCrediticia set buroCredito = ?, creditoActual = ?, importeCredito = ? WHERE idReferencia = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia Personal actualizada');

        })

    })

});

routes.put('/modificarReferencia4', (req, res) => {

    const { idReferencia, tarjetaCredito, tarjetaDebito, cuentaBancaria } = req.body;

    const values = [tarjetaCredito, tarjetaDebito, cuentaBancaria, idReferencia];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE referenciaBancaria set tarjetaCredito = ?, tarjetaDebito = ?, cuentaBancaria = ? WHERE idReferencia = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('Referencia Personal actualizada');

        })

    })

});

routes.put('/modificarEmpleado', (req, res) => {

    const { idEmpleado, nombre, apellidoPaterno, apellidoMaterno, calle, direccionNumero, codigoPostal, email, telefono } = req.body;

    const values = [nombre, apellidoPaterno, apellidoMaterno, calle, direccionNumero, codigoPostal, email, telefono, idEmpleado];

    req.getConnection((error, connect) => {

        if (error) return res.send(error);

        const query = 'UPDATE empleado set nombre = ?, apellidoPaterno = ?, apellidoMaterno = ?, calle = ?, direccionNumero = ?, codigoPostal = ?, email = ?, telefono = ? WHERE idEmpleado = ?;'

        connect.query(query, values, (error, rows) => {

            if (error) return res.send(error);

            res.send('La información del empleado ha sido actualizada');

        })

    })

});




module.exports = routes