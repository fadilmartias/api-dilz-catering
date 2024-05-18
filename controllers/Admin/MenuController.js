import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Menu {
  list = async (req, res) => {
    try {
      const [menus] = await db.execute("SELECT * FROM menus");
      return successRes(res, menus, `Menu data have been retrieved.`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  listToday = async (req, res) => {
    try {
      const [menus, fields] = await db.execute(
        "SELECT * FROM menus WHERE status = 1 AND date = CURDATE()"
      );
      return successRes(res, menus, `Today menu data have been retrieved.`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };

  actionMenu = async (req, res) => {
    try {
      const input = req.body;
      if (input.id == 0) {
        const [rows, fields] = await db.execute(
          `INSERT INTO menus (menu_name, description, price, slug) VALUES (?, ?, ?, ?)`,
          [input.menu_name, input.description, input.price, input.slug]
        );
        return successRes(res, rows, `${rows.affectedRows} record has been added`);
      } else {
        const [rows, fields] = await db.execute(
          `UPDATE menus SET menu_name = ?, description = ?, price = ?, slug = ? WHERE id = ? `,
          [
            input.menu_name,
            input.description,
            input.price,
            input.slug,
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

  addMenuToday = async (req, res) => {
    const input = req.body;
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
      let affectedRows = 0;
      for (const item of input) {
        const [rows, fields] = await conn.execute("UPDATE menus SET stock = ?, status = 1, date = CURDATE() WHERE id = ?", [item.stock, item.id_menu]);
        affectedRows += rows.affectedRows;
      }
      await conn.commit();
      return successRes(res, null, `${affectedRows} records have been updated`);
    } catch (err) {
      console.log(err);
      await conn.rollback();
      return errorRes(res, err.message);
    } finally {
      conn.release();
    }
  };

  deleteMenu = async (req, res) => {
    const input = req.params;
    console.log(input.id);
    try {
      const [rows, fields] = await db.execute(`DELETE FROM menus WHERE id = ?`, [input.id]);
        return successRes(res, rows, `${rows.affectedRows} record has been deleted`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message);
    }
  };
}
export default Menu;
