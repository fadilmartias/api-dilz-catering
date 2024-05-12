import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";
import {
  generateInvoiceNumber,
} from "../../utils/helper.js";
class Transaction {
  // constructor() {}

  list = async (req, res) => {
    const input = req.body;
    console.log(input.date);
    try {
      const query = `SELECT t.*, td.*, t.id id_transaction, u.*, u.id id_user, td.id id_detail, t.status status_bayar FROM transactions t JOIN users u ON t.id_user = u.id JOIN transaction_details td ON t.id = td.id_transaction WHERE 1 AND DATE(td.created_at) = DATE_FORMAT(STR_TO_DATE('${input.date}', '%d-%m-%Y'), '%Y-%m-%d') ORDER BY t.created_at DESC`;
      console.log();
      db.query(query, (error, result) => {
        if (error) return errorRes(res, error);
        // console.log(result);
        const id_users = [];
        // Objek untuk menyimpan hasil transformasi
        var transformedData = [];

        // Loop melalui setiap entri hasil query
        let no = -1;
        result.map(function (entry, idx) {
          console.log(transformedData, !id_users.includes(entry.id_user));

          if (!id_users.includes(entry.id_user)) {
            no++;
            var transaction = {
              id_transaction: entry.id_transaction,
              id_user: entry.id_user,
              name: entry.name,
              total_price: entry.total_price,
              status_bayar: entry.status_bayar,
              details: [],
            };
            id_users.push(entry.id_user);
            transformedData.push(transaction);
          }

          // Objek untuk detail setiap transaksi
          var detail = {
            id_detail: entry.id_detail,
            menu_name: entry.menu_name,
            qty: entry.qty,
            price: entry.price,
            item_price: entry.item_price,

            // Menambahkan detail ke dalam array details di objek transformedData
          };
          transformedData[no].details.push(detail);
        });

        // Menampilkan hasil transformasi
        return successRes(res, transformedData, "List Transactions");
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  listByToday = async (req, res) => {
    try {
      const query = `SELECT 
        created_at AS date, 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS lunas,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS belum_lunas FROM transactions WHERE DATE(created_at) = CURDATE() GROUP BY created_at ORDER BY created_at DESC`;
      db.query(query, (error, result) => {
        if (error) return errorRes(res, error, "Error", 500);
        return successRes(res, result, "List Transactions");
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  listByDate = async (req, res) => {
    try {
      const query = `SELECT 
      created_at AS date, 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS lunas,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS belum_lunas FROM transactions GROUP BY created_at ORDER BY created_at DESC`;
      db.query(query, (error, result) => {
        if (error) return errorRes(error, "Error", res, 500);
        return successRes(res, result);
      });
    } catch (err) {
      console.log(err);
      return errorRes(res.err.message);
    }
  };

  addMultipleOrder = async (req, res) => {
    try {
      const input = req.body;
      let resultFinal = {
        transaction: "0 data ditambahkan",
        transaction_detail: "0 data ditambahkan",
      };
      console.log(input);
      db.beginTransaction(function (err) {
        if (err) {
          return errorRes(res, err);
        }
        let affectedRowsTransaction = 0;
        let affectedRowsDetail = 0;
        input.map(async(item, idx) => {
          const noInvoice = generateInvoiceNumber();
          let lastIdTransaction;
          const sql_transaction = `INSERT INTO transactions (no_invoice, id_user, status, total_price) VALUES (?, ?, ?, ?)`;
          if (item.menu.length > 0 && item.total_price > 0) {
            try {
              const [rows, fields] = await db.promise().query(
                sql_transaction,
                [noInvoice, item.id_user, 0, item.total_price])
                lastIdTransaction = rows.insertId;
                console.log(lastIdTransaction);
                affectedRowsTransaction++;
            } catch (error) {
              console.log(error);
            }
            item.menu.map(async (detail, idx) => {
              if (
                detail.id_menu != "" &&
                detail.qty > 0 &&
                detail.subtotal > 0
              ) {
                let menu_name;
                try {
                  const [rows, fields] = await db
                    .promise()
                    .query(`SELECT menu_name FROM menus WHERE id = ? LIMIT 1`, [
                      detail.id_menu,
                    ]);
                  menu_name = rows[0].menu_name;
                  // Lakukan sesuatu dengan hasil query
                } catch (error) {
                  db.rollback(function () {
                    return errorRes(res, error);
                  });
                  console.error("Error querying database:", error);
                }
                const sql_transaction_detail = `INSERT INTO transaction_details (id_transaction, menu_name, item_price, price, status, qty) VALUES (?, ?, ?, ?, ?, ?)`;
                db.query(
                  sql_transaction_detail,
                  [
                    lastIdTransaction,
                    menu_name,
                    detail.price,
                    detail.subtotal,
                    0,
                    detail.qty,
                  ],
                  (error, result) => {
                    if (error) {
                      // Rollback jika terjadi kesalahan
                      // db.rollback(function () {
                      //   return errorRes(res, error);
                      // });
                      console.log(error);
                    }
                  }
                );
                affectedRowsDetail++;
              } else {
                resultFinal.transaction_detail = `${affectedRowsDetail} data transaksi detail ditambahkan`;
              }
            });
            resultFinal.transaction_detail = `${affectedRowsDetail} data transaksi detail ditambahkan`;
          } else {
            resultFinal.transaction = `${affectedRowsTransaction} data transaksi ditambahkan`;
          }
        });
        resultFinal.transaction = `${affectedRowsTransaction} data transaksi ditambahkan`;

        // Commit transaksi jika berhasil
        db.commit(function (err) {
          if (err) {
            return errorRes(res, err);
          }
          // Mengembalikan respon atau melakukan tindakan lainnya
          return successRes(
            res,
            `${resultFinal.transaction}, ${resultFinal.transaction_detail}`,
            "Transaksi berhasil ditambahkan!"
          );
        });
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  updateStatusTransaction = async (req, res) => {
    try {
      const input = req.body;
      let resultFinal = {};
      const sql = `UPDATE transactions SET status = ? WHERE id = ?`;
      db.query(sql, [input.status, input.id_transaction], (err, result) => {
        if (err) {
          return errorRes(res, err.message);
        }
        return successRes(res, result.affectedRows);
      });
    } catch (err) {
      return errorRes(res, err);
    }
  };
}

export default Transaction;
