import express from "express";
import http from "http";
import { type } from "os";
import WebSocket from "ws";

const app = express();

// view 설정 (pug로 view engine 설정)
app.set("view engine", "pug");

// Express에 template이 어디 있는지 지정
app.set("views", __dirname + "/views");

// public url 생성해서 유저에게 파일을 공유 
app.use("/public", express.static(__dirname + "/public"));

// render 설정 
app.get("/", (_, res) => res.render("home"));

// chachall url 사용 (url 뒤에 아무 오타가 나도 home으로 리다이렉트)
app.get("/*", (_, res) => res.redirect("/"));

// http와 ws 프로토콜 2개를 모두 합칠 예정 
const handleListen = () => console.log(`Listening on http://localhost:3000`); //app.listen(3000, handleListen);

/* http 서버 위에 ws 서버를 만들기 */
// http 프로토콜 서버 
const server = http.createServer(app);
// websocket 프로토콜 서버 
const wss = new WebSocket.Server({ server });

// function 메시지 정리
function onSocketClose(){
    console.log("Disconnected from the Browser!");
};

// 누군가 서버에 연결하면 그 커넥션을 넣음 
const sockets = [];

// on 메서드는 백엔드에서 연결된 사람의 정보를 제공해준다, 코드는 2번 작동한다 
wss.on("connection", (socket)=> {
    sockets.push(socket);

    // 익명의 닉네임을 가진 사람을 정의 
    socket["nickName"] = "Anonymous";

    // 브라우저 연결 
    console.log("Connected to Browser!");

    // 브라우저 끊김
    socket.on("close", onSocketClose);

    // string 형식의 메시지 받기 
    socket.on("message", (msg) => {
        // 프론트로 받은 메세지를 다시 돌려주기 
        const message = JSON.parse(msg);    //JSON으로 변환 
        switch(message.type) {
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickName} : ${message.payload.toString('utf8')}`)); //닉네임 프로퍼티를 socket object에 저장하고 있음 
            case "nickName":
                socket["nickName"] = message.payload.toString('utf8');
        }
    });
});

server.listen(3000, handleListen);


{
    type:"message";
    payload:"hi everyone!";
}

{
    type:"nickName";
    payload:"anna";
}