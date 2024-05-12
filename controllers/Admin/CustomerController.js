import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Customer {
  list = async (req, res) => {
    try {
      const course =
        "SELECT * FROM users WHERE status = 1 AND role = 'customer'";
      db.query(course, (error, result) => {
        if (error) return errorRes(res, error);
        return successRes(res, result);
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  actionCustomer = async (req, res) => {
    const input = req.body;
    try {
      if(input.id == 0) {
        const sql = `INSERT INTO users (username, name, email, phone, password) VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [input.username, input.name, input.email, input.phone, input.password], (error, result) => {
          if (error) {
            console.log(error);
            return errorRes(res, error);
          }
          return successRes(res, result, 'Data berhasil ditambahkan');
        });
      } else {
        const sql = `UPDATE users SET username = ?, name = ?, email = ?, phone = ?, password = ? WHERE id = ? `;
        db.query(sql, [input.username, input.name, input.email, input.phone, input.password, input.id], (error, result) => {
          if (error) {
            console.log(error);
            return errorRes(res, error);
          }
          return successRes(res, result, 'Data berhasil diupdate');
        });
      }
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  deleteCustomer = (req, res) => {
    const input = req.params;
    console.log(input.id);
    try {
      const sql = `DELETE FROM users WHERE id = ?`;
      db.query(sql, [input.id], (error, result) => {
        if (error) {
          console.log(error);
          return errorRes(res, error);
        }
        return successRes(res, result, 'Data berhasil dihapus');
      });
    } catch (error) {
      
    }
  }
}
export default Customer;
