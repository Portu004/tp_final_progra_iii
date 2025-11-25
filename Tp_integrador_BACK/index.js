import express from "express";
const app = express(); // app es la instancia de la aplicacion express

import environments from "./src/api/config/environments.js"; // Importamos las variables de entorno para definir el puerto
const PORT = environments.port;

import cors from "cors";

import { loggerUrl, saluditos } from "./src/api/middlewares/middlewares.js";
import { productRoutes } from "./src/api/routes/index.js";
import { join, __dirname } from "./src/api/utils/index.js";
import connection from "./src/api/database/db.js";



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


// Login Administrador
app.post('/loginAdmin', async (req, res) => {
try {
    const { usuario, password } = req.body;
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE correo = ? AND contrasenia = ?',
    [usuario, password]
    );

    if (rows.length > 0) {
    res.json({ ok: true });
    } else {
    res.json({ ok: false });
    }
} catch (error) {
    console.error("Error en loginAdmin:", error.message);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
}
});

// Login Cliente
app.post('/loginCliente', (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                ok: false,
                message: "Debe ingresar un nombre válido"
            });
        }

        // Si todo está bien, devolvemos el nombre
        res.status(200).json({
            ok: true,
            nombre
        });

    } catch (error) {
        console.error("Error en loginCliente:", error.message);

        res.status(500).json({
            ok: false,
            message: "Error interno del servidor"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});