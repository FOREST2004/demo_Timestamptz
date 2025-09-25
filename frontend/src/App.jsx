import React, { useState, useEffect } from "react";

function App() {
  const [datetime, setDatetime] = useState(""); // datetime user chọn
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
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ datetime }).toString(), 
    });
    
    if (res.ok) {
      const responseText = await res.text();
      const data = Object.fromEntries(new URLSearchParams(responseText));
      
      if (data.success === "true") {
        // Chỉ cần refresh lại data từ DB
        fetchTimes();
        // Reset form nếu muốn
        setDatetime("");
      }
    } else {
      alert("Lưu thất bại!");
    }
  };







  //delete function
  const deleteTime = async(id) => {
    const res = await fetch(`http://localhost:4004/delete/${id}`,{
      method: "DELETE",
    });
    
    if(res.ok){
        setRecords((prev) => prev.filter((r) => r.id !== id));
    } else{
      alert("delete failure");
    }
  }






  // Fetch dữ liệu từ DB để hiển thị
  const fetchTimes = async () => {
    const res = await fetch("http://localhost:4004/times");
    const responseText = await res.text();
    const parsedData = Object.fromEntries(new URLSearchParams(responseText));
    
    // Parse dữ liệu từ form-encoded format
    const count = parseInt(parsedData.count) || 0;
    const dbData = [];
    
    for (let i = 0; i < count; i++) {
      dbData.push({
        id: parsedData[`id_${i}`],
        ts_with_tz: parsedData[`ts_with_tz_${i}`],
        ts_without_tz: parsedData[`ts_without_tz_${i}`]
      });
    }
    
    console.log("🈯️ Dữ liệu từ Server trả về Client: ", dbData);

    const enriched = dbData.map((r) => ({
      id: r.id,
      clientTime: r.client_time || "",        
      backendReceived: r.backend_received || "", 
      withTZ: r.ts_with_tz,
      withoutTZ: r.ts_without_tz
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
