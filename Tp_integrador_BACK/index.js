import express from "express";
const app = express(); // app es la instancia de la aplicacion express

import environments from "./src/api/config/environments.js"; // Importamos las variables de entorno para definir el puerto
const PORT = environments.port;

import cors from "cors";

import { loggerUrl, saluditos } from "./src/api/middlewares/middlewares.js";
import { productRoutes } from "./src/api/routes/index.js";


/*====================
    Middlewares
====================*/
app.use(cors()); //Middleware CORS basico que permite todas las solicitudes
app.use(express.json()); // Middleware que transforma el JSON de las peticiones POST y PUT a objetos JS
app.use(loggerUrl);

// Middleware saluditos, saluda entre la peticion req y la respuesta
// app.use(saluditos);



/*==================
    Rutas
==================*/

// Endpoint que no devuelve ninguna respuesta y queda la llamada colgada y la conexion sin terminar
app.get("/test", (req, res) => {
    console.log("Este endpoint no ofrece ninguna respuesta y se queda aca trabado...");
});

app.use("/api/products", productRoutes);
// app.use("/api/users", rutasUsuarios);








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