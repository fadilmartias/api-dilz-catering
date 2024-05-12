import express from "express";
import Menu from "../../controllers/Admin/MenuController.js";
import Customer from "../../controllers/Admin/CustomerController.js";
import Transaction from "../../controllers/Admin/TransactionController.js";

const router = express.Router();
const transactions = new Transaction();
const menu = new Menu();
const customers = new Customer();

// customers routes
router.get("/customers/list", customers.list);
router.post("/customers/actionCustomer", customers.actionCustomer);
router.delete("/customers/deleteCustomer/:id", customers.deleteCustomer);

// menu routes
router.get("/menu/list", menu.list);
router.get("/menu/listToday", menu.listToday);
router.post("/menu/actionMenu", menu.actionMenu);
router.delete("/menu/deleteMenu/:id", menu.deleteMenu);
router.post("/menu/addMenuToday", menu.addMenuToday);

//transactions routes
router.post("/transactions/list", transactions.list);
router.get("/transactions/listByDate", transactions.listByDate);
router.get("/transactions/listByToday", transactions.listByToday);
router.post("/transactions/addMultipleOrder", transactions.addMultipleOrder);
router.post("/transactions/updateStatusTransaction", transactions.updateStatusTransaction);

export default router;
