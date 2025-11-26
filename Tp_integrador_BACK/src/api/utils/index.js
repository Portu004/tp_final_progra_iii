// Logica para trabajar con archivos y rutas de proyecto

// Importacion de modulos para poder trabajar con rutas
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Obtener nombre del archivo actual
const __filename = fileURLToPath(import.meta.url);

// Obtener el directorio del archivo actual
const __dirname = join(dirname(__filename), "../../../"); // Aca apunto a la raiz de mi proyecto retrocediendo 3 niveles (carpetas)

export {
    __dirname,
    join
}

