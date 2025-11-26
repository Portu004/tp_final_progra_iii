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

/*====================
    Middlewares
====================*/
app.use(cors()); //Middleware CORS basico que permite todas las solicitudes
app.use(express.json()); // Middleware que transforma el JSON de las peticiones POST y PUT a objetos JS
app.use(loggerUrl);

// Middleware saluditos, saluda entre la peticion req y la respuesta
// app.use(saluditos);


// Middleware para servir archivos estaticos
app.use(express.static(join(__dirname, "src/public"))); // Vamos a construir la ruta relativa para servir los archivos de la carpeta /public

app.use(session({
    secret: SESSION_KEY,
    resave: false,
    saveUininitialized: true
}));

app.use(express.urlencoded({
    extended: true
}))
/*=====================
    Configuracion
====================*/
app.set("view engine", "ejs"); // Configuramos EJS como motor de plantillas
app.set("views", join(__dirname, "src/views")); // Indicamos la ruta de las vistas en nuestro proyecto






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

// TO DO -> Por que no linkea bien las rutas de js y css desde viewRoutes /dashboard/consultar
//app.use("/dashboard", viewRoutes);
// Rutas de las vistas
app.get("/index", async (req, res) => {
    try {

        const [rows] = await connection.query("SELECT * FROM productos")
        res.render("index", {
            productos: rows
        });

    } catch (error) {
        console.error(error)
    }
});

app.get("/consultar", (req, res) => {
    res.render("get");
});

app.get("/crear", (req, res) => {
    res.render("create");
});

app.get("/modificar", (req, res) => {
    res.render("update");
});

app.get("/eliminar", (req, res) => {
    res.render("delete");
});

app.post("/api/users", async (req, res) => {
try {
        const { correo, password } = req.body;

        if(!correo || !password ) {
            return res.status(400).json({
                message: "Datos invalidos, asegurate de enviar todos los campos"
            });
        }

        let sql = 
            `INSERT INTO usuarios (correo, password)
            VALUES (?, ?)`
        ;

        const [rows] = await connection.query(sql, [correo, password]);

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});