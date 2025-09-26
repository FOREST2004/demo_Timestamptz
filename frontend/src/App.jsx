import React, { useState, useEffect } from "react";

function App() {
  const [datetime, setDatetime] = useState("");
  const [records, setRecords] = useState([]);

  // Lưu thời gian
  const saveTime = async () => {
    if (!datetime) {
      alert("Vui lòng chọn ngày giờ!");
      return;
    }
    console.log("🎏 Thời gian ở Client khi user vừa nhập: " + datetime);

    const res = await fetch("http://localhost:4004/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datetime }),

      // headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // body: new URLSearchParams({ datetime }).toString(),
    });

    if (res.ok) {
      // const data = await res.json();
      // const responseText = await res.text();
      // const data = Object.fromEntries(new URLSearchParams(responseText));

      let data;
      const contentType = res.headers.get("content-type");
      console.log(
        "😘 Content-Type từ response header (lúc này chỉ in ra xem trước, sau đó sẽ check để parse): ",
        contentType
      );

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (
        contentType &&
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        const responseText = await res.text();
        data = Object.fromEntries(new URLSearchParams(responseText));
      } else {
        console.log(
          "XXX Định dạng server gửi lên, Client ko xử lý được: ",
          contentType
        );
        return;
      }

      if (data.success === "true" || data.success === true) {
        fetchTimes();

        setDatetime("");
      }
    } else {
      alert("Lưu thất bại!");
    }
  };

  //delete function
  const deleteTime = async (id) => {
    const res = await fetch(`http://localhost:4004/delete/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("delete failure");
    }
  };

  const fetchTimes = async () => {
    const res = await fetch("http://localhost:4004/times");
    // const dbData = await res.json();

    let dbData;
    const contentType = res.headers.get("content-type");
    console.log("🥳[fetch] Content-Type: ", contentType);

    if (contentType && contentType.includes("application/json")) {
  
      try {
        dbData = await res.json();

        if (!Array.isArray(dbData)) {
          alert(
            "❌ Lỗi: Server gửi Content-Type là JSON nhưng định dạng không phải array!"
          );
          return;
        }

      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        alert(
          "❌ Lỗi: Server gửi Content-Type là JSON nhưng body không phải JSON format => saiiii"
        );
        return;
      }
    } else if (
      contentType &&
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const responseText = await res.text();
      const parsedData = Object.fromEntries(new URLSearchParams(responseText));
      const count = parseInt(parsedData.count) || 0;
      dbData = []; 
      for (let i = 0; i < count; i++) {
        dbData.push({
          id: parsedData[`id_${i}`],
          ts_with_tz: parsedData[`ts_with_tz_${i}`],
          ts_without_tz: parsedData[`ts_without_tz_${i}`],
        });
      }

      if (!parsedData.count && responseText.length > 0) {
        alert(
          "❌ Lỗi: Server gửi Content-Type là form-encoded nhưng thiếu field 'count' => nghĩa là content-type và body đang ko khớp...!!! hehehe"
        );
        return;
      }
    } else {
      console.log(
        "XXX Định dạng server gửi lên, Client ko xử lý được: ",
        contentType
      );
      return;
    }

    console.log(
      "🈯️ Dữ liệu từ Server trả về Client [khi sẽ parse xong]: ",
      dbData
    );

    const enriched = dbData.map((r) => ({
      id: r.id,
      clientTime: r.client_time || "",
      backendReceived: r.backend_received || "",
      withTZ: r.ts_with_tz,
      withoutTZ: r.ts_without_tz,
    }));

    setRecords(enriched);
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔍 So sánh thời gian</h2>

      <label>
        Chọn ngày giờ:
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </label>
      <button onClick={saveTime} style={{ marginLeft: "10px" }}>
        💾 Lưu thời gian
      </button>

      <h3>TIME GET</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client gửi</th>
            <th>DB ts_with_tz</th>
            <th>DB ts_without_tz</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.clientTime}</td>
              <td>{r.withTZ}</td>
              <td>{r.withoutTZ}</td>
              <td>
                <button onClick={() => deleteTime(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
