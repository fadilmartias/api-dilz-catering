import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Menu {
  list = async (req, res) => {
    try {
      const course = "SELECT * FROM menus";
      db.query(course, (error, result) => {
        if (error) return errorRes(res, error);
        return successRes(res, result);
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  listToday = async (req, res) => {
    try {
      const course = "SELECT * FROM menus WHERE status = 1 AND date = CURDATE()";
      db.query(course, (error, result) => {
        if (error) return errorRes(res, error);
        return successRes(res, result);
      });
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  actionMenu = async (req, res) => {
    try {
      const input = req.body;
      if(input.id == 0) {
        const sql = `INSERT INTO menus (menu_name, description, price, slug) VALUES (?, ?, ?, ?)`;
        db.query(sql, [input.menu_name, input.description, input.price, input.slug], (error, result) => {
          if (error) {
            console.log(error);
            return errorRes(res, error);
          }
          return successRes(res, result, 'Data berhasil ditambahkan');
        });
      } else {
        const sql = `UPDATE menus SET menu_name = ?, description = ?, price = ?, slug = ? WHERE id = ? `;
        db.query(sql, [input.menu_name, input.description, input.price, input.slug, input.id], (error, result) => {
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

  addMenuToday = async (req, res) => {
    try {
      const input = req.body;
      let resultFinal = "";
      console.log(input);
      input.map((item, idx) => {
        const sql = `UPDATE menus SET stock = ?, status = 1, date = CURDATE() WHERE id = ?`;
        db.query(sql, [item.stock, item.id_menu], (error, result) => {
          if (error) return errorRes(res, error);
          resultFinal = result;
        });
      });
      return successRes(res, resultFinal);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  deleteMenu = (req, res) => {
    const input = req.params;
    console.log(input.id);
    try {
      const sql = `DELETE FROM menus WHERE id = ?`;
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
export default Menu;
