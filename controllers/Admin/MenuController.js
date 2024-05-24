import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Menu {
  list = async (req, res) => {
    try {
      const [menus] = await db.execute("SELECT m.*, JSON_ARRAYAGG(c.category) AS categories FROM menus m LEFT JOIN menu_categories mc ON m.id = mc.id_menu LEFT JOIN categories c ON mc.id_category = c.id GROUP BY m.id");
      return successRes(res, menus, `Menu data have been retrieved.`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };

  listToday = async (req, res) => {
    try {
      const [menus, fields] = await db.execute(
        "SELECT m.*, JSON_ARRAYAGG(c.category) AS categories FROM menus m LEFT JOIN menu_categories mc ON m.id = mc.id_menu LEFT JOIN categories c ON mc.id_category = c.id WHERE m.status <> 0 AND date = CURDATE() GROUP BY m.id"
      );
      return successRes(res, menus, `Today menu data have been retrieved.`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
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
      return errorRes(res, err.message ? err.message : err.sqlMessage);
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
      return errorRes(res, err.message ? err.message : err.sqlMessage);
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
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };
}
export default Menu;
