import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "dilzstudio.com",
  user: "dila9917_admin",
  password: "namakau123",
  database: "dila9917_dilz_catering",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
