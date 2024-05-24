import { db } from "../../config/database.js";
import { errorRes, successRes } from "../../utils/response.js";

class Setting {
  list = async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT * FROM settings LIMIT 1");
      return successRes(res, rows[0], `Settings have been retrieved.`);
    } catch (err) {
      console.log(err);
      return errorRes(res, err.message ? err.message : err.sqlMessage);
    }
  };
}
export default Setting;
