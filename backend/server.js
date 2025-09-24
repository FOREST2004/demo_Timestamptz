// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";

process.env.TZ = "Asia/Dubai";

const { Pool, types } = pkg;
const app = express();
app.use(bodyParser.json());
app.use(cors());

// ==================
// Override parser
// ==================
//object identifier
// OID 1114 = timestamp without time zone
// OID 1184 = timestamp with time zone
//types.setTypeParser(1114, (stringValue) => stringValue); 
//types.setTypeParser(1184, (stringValue) => stringValue);
/*
without timezone thì database chỉ lưu giá trị string. 
khi backend nhận thì parse(phân tích nó ra) 
new Date("YYYY-MM-DD HH:mm:ss") JavaScript hiểu theo local timezone của môi trường runtime (server OS).
và nó sẽ ép kiểu về dạng toIOSstring và -7 giờ thành 2025-09-22T12:00:00
*/

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "testdb",
  password: "1234",
  port: 5432,
});

// ================= Lưu thời gian =================
app.post("/save", async (req, res) => {
  try {
    const { datetime } = req.body;
    const receivedAt = new Date();
    console.log("--- thời gian trước khi lưu vào database:: " + datetime);

    const result = await pool.query(
      `INSERT INTO time_test (ts_with_tz, ts_without_tz) VALUES ($1::timestamptz, $1::timestamp) RETURNING *`,
      [datetime]
    );

    //console.log("💾 Inserted:", result.rows[0]);
    res.json({ ...result.rows[0]});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ================= Lấy danh sách raw từ DB =================
app.get("/times", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM time_test ORDER BY id DESC");
    console.log("get time from DB: ", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ============ delete function ==============
app.delete("/delete/:id", async(req, res) => {
  const {id} = req.params;
  try{
    await pool.query("DELETE FROM time_test WHERE id =$1", [id]); //postgreSQL
    res.json({success: true});
  } catch(err){
    console.error("Delete error: ", err.message);
    res.status(500).json({error: "delete failed"});
  }
})

/*
async function main() {
  const result = await pool.query("SELECT id, ts_with_tz, ts_without_tz FROM time_test ORDER BY id DESC LIMIT 1");

  console.log("📌 Raw data từ PostgreSQL:");
  console.log(result.rows[0]);
}
*/
//main().catch(console.error);
app.listen(4004, () => console.log("🚀 Backend chạy ở http://localhost:4004"));
