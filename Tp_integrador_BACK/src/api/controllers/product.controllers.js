/*===============================
    Controladores productos
===============================*/

import ProductModel from "../models/product.models.js";


export const getAllProducts = async (req, res) => {

    try {

        
        const [rows] = await ProductModel.selectAllProducts();

        
        res.status(200).json({
            payload: rows,
            message: rows.length === 0 ? "No se encontraron productos" : "Productos encontrados"
        });
        
    
    } catch (error) {
        console.error("Error obteniendo productos", error.message);

        res.status(500).json({
            message: "Error interno al obtener productos"
        });
    }
}



export const getProductById = async (req, res) => {

    try {
        
        let { id } = req.params; 


        let [rows] = await ProductModel.selectProductWhereId(id);
        

        if(rows.length === 0) {
    
            console.log(`Error! No se encontro producto con id ${id}`);

            
            return res.status(404).json({
                message: `No se encontro producto con id ${id}`
            });
        }

 
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

}


// Create product -> Crear un nuevo producto
export const createProduct = async (req, res) => {

    try {
      

        // Gracias al destructuring, recogemos estos datos del body
        let { image, name, price, type } = req.body;
        console.log(req.body);

        // Optimizacion 1: Validacion de datos de entrada
        if(!image || !name || !price || !type) {
            return res.status(400).json({
                message: "Datos invalidos, asegurate de enviar todos los campos"
            });
        }

        let [result] = await ProductModel.insertProduct(image, name, price, type);
        console.log(result);

        // Codigo de estado 201 -> Created
        res.status(201).json({
            message: "Producto creado con exito",
            productId: result.insertId
        });

    } catch(error) {
        console.log(error);

        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        })
    }
}


// Update product -> Actualiza un producto
export const updateProduct = async (req, res) => {
    try {
        let { id, name, image, type, price, active } = req.body;

        // Optimizacion 1: Validacion basica de datos recibidos
        if(!id || !name || !image || !type || !price || !active) {
            return res.status(400).json({
                message: "Faltan campos requeridos"
            });
        }

        let sql = `
            UPDATE productos
            SET nombre = ?, imagen = ?, tipo = ?, precio = ?, activo = ?
            WHERE id = ?
        `;

        let [result] = await ProductModel.updateProduct(name, image, type, price, active, id);
        console.log(result);

        // Optimizacion 2: Testeamos que se actualizara, esto lo sabemos gracias a affectedRows que devuelve result
        if(result.affectedRows === 0) { // No se actualizo nada
            return res.status(400).json({
                message: "No se actualizo el producto"
            });
        }

        res.status(200).json({
            message: `Producto con id ${id} actualizado correctamente`
        });

    } catch (error) {
        console.error("Error al actualizar productos", error);

        res.status(500).json({
            message: "Error interno del servidor", error
        });
    }
}


// Delete product -> Eliminar un producto
export const removeProduct = async (req, res) => {
    try {
        let { id } = req.params;

        let [result] = await ProductModel.deleteProduct(id);
        console.log(result);

        // Optimizacion 2: Testeamos que se borro, esto lo sabemos gracias a affectedRows que devuelve result
        if(result.affectedRows === 0) { // No se borro nada
            return res.status(400).json({
                message: "No se eliminó el producto"
            });
        }
        

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
}