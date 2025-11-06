import express from "express";
const app = express();

import environments from "./src/api/config/environments.js";

import connection from "./src/api/database/db.js";

import cors from "cors";

const PORT = environments.port;
console.log(PORT);





app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("hola mundo desde express.js")
});





/*==================
    Endpoints
==================*/
app.get("/", (req, res) => {
    res.send("Holis mundo desde Express.js");
});


//Traer todos los productos
app.get("/products", async (req, res) => {

    try {
        const sql = "SELECT * FROM productos";
    
        // Con rows extraemos exclusivamente los datos que solicitamos en la consulta
        const [rows] = await connection.query(sql);

        // Comprobamos que se reciban correctamente los productos
        // console.log(rows);
        
        res.status(200).json({
            payload: rows
        });
        
    
    } catch (error) {
        console.error("Error obteniendo productos", error.message);

        res.status(500).json({
            message: "Error interno al obtener productos"
        });
    }
});


// Get product by id -> Consultar producto por su id
app.get("/products/:id", async (req, res) => {

    try {
        // let id = req.params.id;
        let { id } = req.params; 
        
        let sql = "SELECT * FROM productos WHERE productos.id = ?"; 
        
        let [rows] = await connection.query(sql, [id]); 

        console.log(rows);

        res.status(200).json({
            payload: rows,
            message: "Producto encontrado"
        });

        
    } catch(error) {
        console.error(`Error obteniendo productos con id ${id}`, error.message);

        res.status(500).json({
            message: "Error interno al obtener producto con id"
        })
    }


})





app.post("/products", async (req, res) => {

    try {
        
        let { image, name, price, type } = req.body;

        console.log(req.body);

        let sql = `INSERT INTO productos (imagen, nombre, precio, tipo) VALUES (?, ?, ?, ?)`;

        let [rows] = await connection.query(sql, [image, name, price, type]);

        // Codigo de estado 201 -> Created
        res.status(200).json({
            message: "Producto creado con exito"
        });

    } catch(error) {
        console.log(error);

        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        })
    }
});


// DELETE -> Eliminar un producto por su id
app.delete("/products/:id", async (req, res) => {
    try {
        let { id } = req.params;

        
        let sql = "DELETE FROM productos WHERE id = ?";

        

        let [result] = await connection.query(sql, [id]);
        console.log(result);

        return res.status(200).json({
            message: `Producto con id ${id} eliminado correctamente`
        });

    } catch(error) {
        console.error("Error al eliminar un producto: ", error);

        res.status(500).json({
            message: `Error al eliminar un producto con id ${id}: `, error,
            error: error.message
        })
    }
});


app.listen(PORT, () =>{
    console.log(`servidor corriendo en el puerto:${PORT}`);
});