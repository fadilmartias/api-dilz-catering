import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorRes, successRes } from "../../utils/response.js";
import { db } from "../../config/database.js";

export default class Auth {
  // constructor() {}

  checkEmail = async (req, res) => {
    try {
      const quser = "SELECT id FROM users WHERE email = ?";
      db.query(quser, [req.body.email], async (error, result) => {
        if (error) return errorRes(res, error);
        if (result.length == 0) {
          return errorRes(res, error, "Account not found", 404);
        } else {
          return successRes(res, undefined, "Email sudah terdaftar");
        }
      });
    } catch (error) {
      return errorRes(res, error, "Account not found", 404);
    }
  };

  register = async (req, res) => {
    const { name, username, email, phone, password, confirm_password } = req.body;
    console.log(req.body);
    if (password !== confirm_password)
      return errorRes(res, null, `Confirm Password Doesn't Match`, 400);
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
      const data = {
        name: name,
        email: email,
        phone: phone,
        username: username,
        password: hashPassword,
      };
      const qinsert = `INSERT INTO users SET ?`;
      db.query(qinsert, data, (error, result) => {
        console.log(error);
        if (error?.code == "ER_DUP_ENTRY")
          return errorRes(res, error, "Email/username already used");
        if (error) return errorRes(res, error);
        return successRes(res, result, "Success Register User");
      });
    } catch (error) {
      console.log(error);
      return errorRes(res, error, `Failed to register user`, 400);
    }
  };

  login = (req, res) => {
    try {
      let user;
      const quser = "SELECT * FROM users WHERE email = ?";
      db.query(quser, [req.body.email], async (error, result) => {
        if (error) return errorRes(res, error);
        if (result.length == 0) {
          return errorRes(res, error, "Account not found", 404);
        } else {
          user = result[0];
          const match = await bcrypt.compare(req.body.password, user.password);
          if (!match) return errorRes(res, null, "Wrong Password", 400);
          const userId = user.id;
          const name = user.name;
          const email = user.email;

          const accessToken = jwt.sign(
            { userId, name, email },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1d",
            }
          );
          const refreshToken = jwt.sign(
            { userId, name, email },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "1d",
            }
          );
          const qupdate = "UPDATE users SET refresh_token = ? WHERE id = ?";
          db.query(qupdate, [refreshToken, userId], async (error, result) => {
            console.log(error);
            if (error) return errorRes(res, error);
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
              // secure: true // jika https
            });
            let formattedUser = {};
            formattedUser.id = user.id;
            formattedUser.email = user.email;
            formattedUser.name = user.name;
            formattedUser.phone = user.phone;
            formattedUser.username = user.username;
            formattedUser.refresh_token = user.refresh_token;
            formattedUser.role = user.role;
            return successRes(
              res,
              { accessToken: accessToken, user: formattedUser },
              "Success Login User",
              200
            );
          });
        }
      });
    } catch (error) {
      console.log(error);
      return errorRes(res, error, "Account not found", 404);
    }
  };

  logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(req.cookies.refreshToken);
    // return;
    if (!refreshToken)
      return errorRes(res, null, "Refresh token not found", 500);
    const user = `SELECT * FROM users WHERE refresh_token = ?`;
    db.query(user, [refreshToken], (error, result) => {
      if (error) return errorRes(res, error, "Error DB", 500);
      if (result.length == 0)
        return errorRes(res, error, "Error Gaada hasil", 500);
      const userId = result[0].id;
      const qupdate = `UPDATE users SET refresh_token = ? WHERE id = ?`;
      db.query(qupdate, [null, userId], (error, result) => {
        if (error) return errorRes(res, error, "Error update", 500);
        res.clearCookie("refreshToken");
        return successRes(res, result, "Success Logout", 200);
      });
    });
  };
  refreshToken = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return errorRes(res, null, "Unauthorized", 401);
      const user = `SELECT * FROM users WHERE refresh_token = ?`;
      db.query(user, [refreshToken], (error, result) => {
        if (error) return errorRes(res, error, "Error", 500);
        if (result.length == 0) return errorRes(res, null, "Unauthorized", 403);
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err) return errorRes(res, null, "Unauthorized", 403);
            const userId = result[0].id;
            const name = result[0].name;
            const email = result[0].email;
            const accessToken = jwt.sign(
              { userId, name, email },
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "1d",
              }
            );
            return successRes(
              res,
              { accessToken: accessToken },
              "Token refreshed",
              200
            );
          }
        );
      });
    } catch (error) {
      console.log(error);
      return errorRes(res, error, "Error", 500);
    }
  };
}
