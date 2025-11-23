import { Router } from "express"; 
import { buscarCliente, createCliente, deleteCliente, getCliente, getClientes, updateCliente } from "../controlers/Clientes";

const router = Router();

router.get("/clientes", getClientes);
router.get("/cliente/:id", getCliente);
router.get("/cliente/buscar", buscarCliente); 
router.post("/cliente/create", createCliente);
router.put("/cliente/update/:id", updateCliente);
router.delete("/cliente/delete/:id", deleteCliente);

export default router;