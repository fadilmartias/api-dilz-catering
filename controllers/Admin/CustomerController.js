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
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  profileCustomer = async (req, res) => {
    const input = req.body;
    let data = {};
    try {
      const [user] = await db.execute(
        `SELECT u.name, u.username, u.phone, u.avatar, COUNT(t.id) as total_order, u.current_point, u.total_point, COUNT(uv.id_user) as total_voucher FROM users u 
        JOIN transactions t ON t.id_user = u.id
        LEFT JOIN user_vouchers uv ON uv.id_user = u.id where u.id = ?`,
        [input.id_user]
      );
      const [setting] = await db.execute(
        `SELECT * FROM settings LIMIT 1`,
        [input.id_user]
      );
      data = user[0]
      if(user[0].current_point >= setting[0].rooster_point) {
        data.img_level = 'ayam_jagoan.svg';
        data.level = 'Ayam Jagoan'
        data.next_level = 'Udah Paling Jago'
        data.next_point = '0';
      } else if (user[0].current_point >= setting[0].hen_point) {
        data.img_level = 'ayam_dewasa.svg'
        data.level = 'Ayam Dewasa'
        data.next_level = 'Ayam Jagoan'
        data.next_point = setting[0].rooster_point;
      } else if (user[0].current_point >= setting[0].chick_point) {
        data.img_level = 'anak_ayam.svg'
        data.level = 'Anak Ayam'
        data.next_level = 'Ayam Dewasa'
        data.next_point = setting[0].hen_point;
      } else {
        data.img_level = 'telur.svg'
        data.level = 'Telur'
        data.next_level = 'Anak Ayam'
        data.next_point = setting[0].chick_point;
      }
      return successRes(res, data, `Customer data have been retrieved`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  actionCustomer = async (req, res) => {
    const input = req.body;
    try {
      if (input.id == 0) {
        const [rows] = await db.execute(
          `INSERT INTO users (username, name, email, phone, password, is_testing) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            input.username,
            input.name,
            input.email,
            input.phone,
            input.password,
            input.is_testing,
          ] // FIXME change is_testing to 0 at prod
        );
        return successRes(
          res,
          rows,
          `${rows.affectedRows} record has been added`
        );
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
        return successRes(
          res,
          rows,
          `${rows.affectedRows} record has been updated`
        );
      }
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  deleteCustomer = async (req, res) => {
    const input = req.params;
    try {
      const [rows] = await db.execute(`DELETE FROM users WHERE id = ?`, [
        input.id,
      ]);
      return successRes(
        res,
        rows,
        `${rows.affectedRows} record has been deleted`
      );
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };
}
export default Customer;
