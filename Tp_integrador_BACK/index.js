import express from "express";
const app = express(); // app es la instancia de la aplicacion express

import environments from "./src/api/config/environments.js"; // Importamos las variables de entorno para definir el puerto
const PORT = environments.port;
const SESSION_KEY = environments.session_key;

import cors from "cors";

import { loggerUrl, saluditos } from "./src/api/middlewares/middlewares.js";
import { productRoutes, viewRoutes } from "./src/api/routes/index.js";
import { join, __dirname } from "./src/api/utils/index.js";
import connection from "./src/api/database/db.js";

import session from "express-session";
/* guarda la info mientras navega el usuario/*
/*====================
    Middlewares
====================*/
app.use(cors()); //Middleware CORS basico que permite todas las solicitudes
app.use(express.json()); // Middleware que transforma el JSON de las peticiones POST y PUT a objetos JS
app.use(loggerUrl); //Middleware que imprime la info de cada peticion



// Middleware para servir archivos estaticos
app.use(express.static(join(__dirname, "src/public"))); // La ruta que permite servir los archivos de la carpeta /public

app.use(session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({
    extended: true
}));
/*=====================
    Configuracion
====================*/
app.set("view engine", "ejs"); // Definimos EJS como motor de plantillas
app.set("views", join(__dirname, "src/views")); // Es la ruta de las vistas de nuestro proyecto






/*==================
    Rutas
==================*/

// Endpoint que no devuelve ninguna respuesta y queda la llamada colgada y la conexion sin terminar
app.get("/test", (req, res) => {
    console.log("Este endpoint no ofrece ninguna respuesta y se queda aca trabado...");
});

app.use("/api/products", productRoutes);
// app.use("/api/users", rutasUsuarios);

app.use("/", viewRoutes);

// ENDPOINT crear usuario
app.post("/api/users", async (req, res) => {
try {
        const { correo, contrasenia } = req.body;

        if(!correo || !contrasenia ) {
            return res.status(400).json({
                message: "Datos invalidos, asegurate de enviar todos los campos"
            });
        }

        let sql = 
            `INSERT INTO usuarios (correo, contrasenia)
            VALUES (?, ?)`
        ;

        const [rows] = await connection.query(sql, [correo, contrasenia]);

        res.status(201).json({
            message: "Usuario creado con exito",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error interno en el servidor",
            error: error
        })
    }
});

// Endpoint para inicio de sesion, recibimos correo y password con una peticion POST
app.post("/login", async (req, res) => {
    try {
        const { correo, contrasenia } = req.body;

        // Evitamos consulta innecesaria
        if(!correo || !contrasenia) {
            return res.render("login", {
                error: "Todos los campos son obligatorios!"
            });
        }
        // busca el usuario en la BD
        const sql = `SELECT * FROM usuarios where correo = ? AND contrasenia = ?`;
        const [rows] = await connection.query(sql, [correo, contrasenia]);

        // Si no existen usuarios con ese correo o password
        if(rows.length === 0) {
            return res.render("login", {
                error: "Credenciales incorrectas!"
            });
        }

        console.log(rows);
        const user = rows[0];
        console.table(user);

        // Ahora toca guardar sesion y hacer el redirect
        // Crearmos la sesion del usuario, que es un objeto que guarda su id y su correo
        req.session.user = {
            id: user.id,
            correo: user.correo
        }

        res.redirect("/"); // Redirigimos a la pagina principal

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// Endpoint para cerrar sesion (destruir sesion y redireccionar)
app.post("/logout", (req, res) => {

    // Destruimos la sesion que habiamos creado
    req.session.destroy((error) => {
        if(error) {
            console.error("Error al destruir la sesion", error);
            return res.status(500).json({
                error: "Error al cerrar la sesion"
            })
        }

        res.redirect("login"); // Redirigimos a login
    })
});


app.post("/api/sales", async (req, res) => {
    try {
        // Recibimos la info del cuerpo de la peticion
        const { nombreUsuario, precioTotal, fechaEmision, productos } = req.body;

        // Validacion de datos
        if(!nombreUsuario || !precioTotal || !fechaEmision || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                message: "Datos invalidos, debes enviar nombreUsuario, precioTotal, fechaEmision y productos"
            });
        }

        // 1. Insertamos la venta en "tickets"
        const sqlTicket = "INSERT INTO tickets (nombreUsuario, precioTotal, fechaEmision) VALUES (?, ?, ?)";
        const [resultadoTicket] = await connection.query(sqlTicket, [nombreUsuario, precioTotal, fechaEmision]);

        // 2. Obtener el ID de la venta recien creada (LAST_INSERT_ID)
        const ticketId = resultadoTicket.insertId;

        // 3. Insertar cada producto en producto_tickets
        const sqlProductoTickets = "INSERT INTO productos_tickets (idProducto, idTicket) VALUES (?, ?)";

        // Al ser una relacion N a N, se debe insertar una fila por cada producto vendido:
        for (const idProducto of productos) {
            await connection.query(sqlProductoTickets, [idProducto, ticketId]);
        }

        // Respuesta de exito
        res.status(201).json({
            message: "Venta registrada con exito!",
            ticketId: ticketId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});