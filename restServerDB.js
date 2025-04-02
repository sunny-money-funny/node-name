const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const mysql = require("mysql2");

require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig).promise();

// 테이블 생성 함수
async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                birth DATE,
                gojail DATE,
                outjail DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    connection.release();
    console.log("테이블 생성 완료");
  } catch (err) {
    console.error("테이블 생성 실패:", err);
  }
}

// 서버 시작 시 테이블 생성
createTable();

http
  .createServer(async (req, res) => {
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }
    
    try {
      if (req.method === "GET") {
        if (req.url === "/") {
          const data = await fs.readFile(
            path.join(__dirname, "restFront.html")
          );
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
        } else if (req.url === "/about") {
          const data = await fs.readFile(path.join(__dirname, "about.html"));
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
        } else if (req.url === "/users") {
          // DB에서 사용자 목록 조회
          const [rows] = await pool.query("SELECT * FROM users");
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
          });
          return res.end(JSON.stringify(rows));
        } else if (req.url === "/restFront.js") {
          const data = await fs.readFile(path.join(__dirname, "restFront.js"));
          res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
          return res.end(data);
        }
        try {
          const data = await fs.readFile(path.join(__dirname, req.url));
          return res.end(data);
        } catch (err) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end("요청하신 페이지를 찾을 수 없습니다.");
        }
      } else if (req.method === "POST") {
        if (req.url === "/user") {
          let body = "";
          req.on("data", (data) => {
            body += data;
          });
          return req.on("end", async () => {
            try {
              console.log("POST 본문(Body):", body);
              const { name, birth, gojail, outjail } = JSON.parse(body);

              // DB에 사용자 추가
              const [result] = await pool.query(
                "INSERT INTO users (name, birth, gojail, outjail) VALUES (?, ?, ?, ?)",
                [name, birth || null, gojail || null, outjail || null]
              );

              res.writeHead(201, {
                "Content-Type": "text/plain; charset=utf-8"
              });
              res.end("등록 성공");
            } catch (err) {
              console.error("사용자 등록 실패:", err);
              console.error(err.stack);
              res.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8"
              });
              res.end("등록 실패: " + err.message);
            }
          });
        } else {
          res.writeHead(404);
          return res.end("NOT FOUND");
        }
      } else if (req.method === "PUT") {
        if (req.url.startsWith("/user/")) {
          const id = req.url.split("/")[2];
          let body = "";
          req.on("data", (data) => {
            body += data;
          });
          return req.on("end", async () => {
            try {
              console.log("PUT 본문(Body):", body);
              const { name, birth, gojail, outjail } = JSON.parse(body);

              // DB에서 사용자 정보 수정
              await pool.query(
                "UPDATE users SET name = ?, birth = ?, gojail = ?, outjail = ? WHERE id = ?", 
                [name, birth || null, gojail || null, outjail || null, id]
              );

              res.writeHead(200, {
                "Content-Type": "text/plain; charset=utf-8"
              });
              res.end("수정 성공");
            } catch (err) {
              console.error("사용자 수정 실패:", err);
              res.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8"
              });
              res.end("수정 실패: " + err.message);
            }
          });
        } else {
          res.writeHead(404);
          return res.end("NOT FOUND");
        }
      } else if (req.method === "DELETE") {
        if (req.url.startsWith("/user/")) {
          const id = req.url.split("/")[2];
          try {
            // DB에서 사용자 삭제
            await pool.query("DELETE FROM users WHERE id = ?", [id]);

            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("삭제 성공");
          } catch (err) {
            console.error("사용자 삭제 실패:", err);
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("삭제 실패: " + err.message);
          }
        } else {
          // DELETE 요청이지만 /user/로 시작하지 않는 경우
          res.writeHead(404);
          return res.end("NOT FOUND");
        }
      } else {
        // GET, POST, PUT, DELETE가 아닌 다른 메서드의 경우
        res.writeHead(404);
        return res.end("NOT FOUND");
      }
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err.message);
    }
  })
  .listen(3000, () => {
    console.log("3000번 포트에서 서버 대기 중입니다");
  });