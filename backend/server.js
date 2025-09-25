// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";

process.env.TZ = "Asia/Dubai";

const { Pool, types } = pkg;
const app = express();
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Xử lý application/x-www-form-urlencoded
app.use(cors());



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
    console.log("📷 Dữ liệu ở Server trước khi lưu vào DB: " + datetime);

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
    console.log("📺 Dữ liệu từ DB lên Server: ", result.rows);
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


app.listen(4004, () => console.log("🚀 Backend chạy ở http://localhost:4004"));
