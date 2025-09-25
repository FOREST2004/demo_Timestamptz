// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";

process.env.TZ = "Asia/Dubai";

const { Pool, types } = pkg;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/x-www-form-urlencoded");

  next();
});

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

    // Chỉ response thành công thôi
    res.send(new URLSearchParams({ success: "true" }).toString());
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(new URLSearchParams({ error: "Something went wrong" }).toString());
  }
});

// ================= Lấy danh sách raw từ DB =================
app.get("/times", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM time_test ORDER BY id DESC");
    console.log("📺 Dữ liệu từ DB lên Server: ", result.rows);

    // Chuyển array thành chuỗi để gửi qua form-encoded
    const responseData = new URLSearchParams();
    result.rows.forEach((row, index) => {
      responseData.append(`id_${index}`, row.id);
      responseData.append(`ts_with_tz_${index}`, row.ts_with_tz);
      responseData.append(`ts_without_tz_${index}`, row.ts_without_tz);
    });
    responseData.append("count", result.rows.length);

    res.send(responseData.toString());

    //  res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(new URLSearchParams({ error: "Something went wrong" }).toString());
  }
});

// ============ delete function ==============
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM time_test WHERE id =$1", [id]);
    res.send(new URLSearchParams({ success: "true" }).toString());
  } catch (err) {
    console.error("Delete error: ", err.message);
    res
      .status(500)
      .send(new URLSearchParams({ error: "delete failed" }).toString());
  }
});

app.listen(4004, () => console.log("🚀 Backend chạy ở http://localhost:4004"));
