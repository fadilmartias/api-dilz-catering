import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";
import { generateInvoiceNumber } from "../../utils/helper.js";
class Transaction {
  // constructor() {}

  list = async (req, res) => {
    const input = req.body;
    const id_users = [];
    let transformedData = [];
    try {
      const [rows] = await db.execute(
        `SELECT t.id id_transaction, td.menu_name, td.qty, t.net_price, u.name, u.id id_user, t.status status_bayar FROM transactions t JOIN users u ON t.id_user = u.id JOIN transaction_details td ON t.id = td.id_transaction WHERE 1 AND DATE(td.created_at) 
        = DATE_FORMAT(STR_TO_DATE('${input.date}', '%d-%m-%Y'), '%Y-%m-%d') ORDER BY t.created_at DESC`
      );

      // Loop melalui setiap entri hasil quey
      let no = -1;
      rows.map(function (entry, idx) {
        // if (!id_users.includes(entry.id_user)) {
          no++;
          var transaction = {
            id_transaction: entry.id_transaction,
            id_user: entry.id_user,
            name: entry.name,
            net_price: entry.net_price,
            status_bayar: entry.status_bayar,
            details: [],
          };
          // id_users.push(entry.id_user);
          transformedData.push(transaction);
        // }

        var detail = {
          id_detail: entry.id_detail,
          menu_name: entry.menu_name,
          qty: entry.qty,
          price: entry.price,
          item_price: entry.item_price,
        };
        transformedData[no].details.push(detail);
      });

      return successRes(res, transformedData, "Transaction has been retrieved");
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  listByToday = async (req, res) => {
    try {
      const [rows] = await db.execute(`SELECT 
        DATE(created_at) AS date, 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS lunas,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS belum_lunas FROM transactions WHERE DATE(created_at) = CURDATE() GROUP BY DATE(created_at) ORDER BY created_at DESC`);
      return successRes(res, rows, "Today transaction has been retrieved");
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  listByDate = async (req, res) => {
    try {
      const [rows] = await db.execute(`SELECT 
      DATE(created_at) AS date, 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS lunas,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS belum_lunas FROM transactions GROUP BY DATE(created_at) ORDER BY created_at DESC`);
      return successRes(res, rows, `Transaction has been retrieved`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  }

  listByUser = async (req, res) => {
    const {id_user} = req.body
    try {
      const [rows] = await db.execute(`SELECT t.*, td.*, td.status status_detail, td.id id_detail, td.qty qty_detail, m.slug FROM transaction_details td
      JOIN transactions t ON td.id_transaction = t.id
      JOIN menus m ON td.id_menu = m.id
      WHERE t.id_user = ? ORDER BY t.created_at DESC`, [id_user]);
      return successRes(res, rows, `Transaction has been retrieved`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  }

  addMultipleOrder = async (req, res) => {
    const input = req.body;
    let affectedRows = {
      transaction: 0,
      transaction_detail: 0,
    };
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
      for (const item of input) {
        const noInvoice = generateInvoiceNumber();
        let lastIdTransaction;
        const sql_transaction = `INSERT INTO transactions (no_invoice, id_user, status, gross_price, net_price, is_testing) VALUES (?, ?, ?, ?, ?, ?)`;
        if (item.menu.length > 0 && item.total_price > 0) {
          const [rows] = await conn.execute(sql_transaction, [
            noInvoice,
            item.id_user,
            0,
            item.total_price,
            item.total_price,
            item.is_testing
          ]);
          lastIdTransaction = rows.insertId;
          affectedRows.transaction += rows.affectedRows

          for (const detail of item.menu) {
            if (detail.id_menu != "" && detail.qty > 0 && detail.subtotal > 0) {
              const [menus] = await conn.execute(
                `SELECT menu_name,img FROM menus WHERE id = ? LIMIT 1`,
                [detail.id_menu]
              );
              const sql_transaction_detail = `INSERT INTO transaction_details (id_transaction, id_menu, menu_name, menu_img, item_price, price, status, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
              const [rows] = await conn.execute(sql_transaction_detail, [
                lastIdTransaction,
                detail.id_menu,
                menus[0].menu_name,
                menus[0].img,
                detail.price,
                detail.subtotal,
                0,
                detail.qty,
              ]);
            affectedRows.transaction_detail += rows.affectedRows
            }
          }
        }
      }
      await conn.commit();
      return successRes(
        res,
        {affectedRows},
        `${affectedRows.transaction} transaction records and ${affectedRows.transaction_detail} detail transaction records has been added`
      );
    } catch (err) {
      console.log(err);
      await conn.rollback();
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    } finally {
      conn.release();
    }
  };

  updateStatusTransaction = async (req, res) => {
    const input = req.body;
    try {
      const [rows] = await db.execute(`UPDATE transactions SET status = ? WHERE id = ?`, [input.status, input.id_transaction]);
        return successRes(res, rows, `${rows.affectedRows} records has been updated`);
    } catch (err) {
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };
}

export default Transaction;
