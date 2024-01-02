import multer from "multer";
import { __dirname } from "../path.js";

//MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //callback
        const uploadPath = `${__dirname}/public/documents`
        console.log(`ruta: ${uploadPath}`);
        cb(null, uploadPath) //null hace referencia a que no se envien errores
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`) //concateno fecha actual en ms con el nombre del archivo
        // ej: 364728doc-eewnoi-vsd
    }
})

const upload = multer({storage: storage})

export default upload
