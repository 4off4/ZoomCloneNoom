import express from "express";

const app = express();

// view 설정 (pug로 view engine 설정)
app.set("view engine", "pug");

// Express에 template이 어디 있는지 지정
app.set("views", __dirname + "/views");

// public url 생성해서 유저에게 파일을 공유 
app.use("/public", express.static(__dirname + "/public"));

// render 설정 
app.get("/", (req, res) => res.render("home"));

// chatAll url 사용 (url 뒤에 아무 오타가 나도 home으로 리다이렉트)
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);