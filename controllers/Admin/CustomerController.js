import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Customer {
  list = async (req, res) => {
    try {
      const [customers] = await db.execute(
        "SELECT * FROM users WHERE status = ? AND role = ?",
        [1, "customer"]
      );
      return successRes(res, customers, "Customer data have been retrieved");
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  actionCustomer = async (req, res) => {
    const input = req.body;
    try {
      if (input.id == 0) {
        const [rows] = await db.execute(
          `INSERT INTO users (username, name, email, phone, password, is_testing) VALUES (?, ?, ?, ?, ?, ?)`,
          [input.username, input.name, input.email, input.phone, input.password, 0] // FIXME change is_testing to 0 at prod
        ); 
        return successRes(res, rows, `${rows.affectedRows} record has been added`);
      } else {
        const [rows] = await db.execute(
          `UPDATE users SET username = ?, name = ?, email = ?, phone = ?, password = ? WHERE id = ? `,
          [
            input.username,
            input.name,
            input.email,
            input.phone,
            input.password,
            input.id,
          ]
        );
        return successRes(res, rows, `${rows.affectedRows} record has been updated`);
      }
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  deleteCustomer = async (req, res) => {
    const input = req.params;
    try {
      const [rows] = await db.execute(`DELETE FROM users WHERE id = ?`, [
        input.id,
      ]);
      return successRes(res, rows, `${rows.affectedRows} record has been deleted`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };
}
export default Customer;
