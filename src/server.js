import http from "http";
import {Server} from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

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


/* http 서버 위에 ws 서버를 만들기 */
// http 프로토콜 서버 
const httpServer = http.createServer(app);

// Socket IO 서버
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],      // 온라인 admin 데모 
      credentials: true
    }
});

instrument(wsServer, {
    auth: false,
    mode: "development",
});

function publicRooms() {
    const { 
        sockets: {
            adapter: {sids, rooms},
        }
    } = wsServer;

    // public rooms list 
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {   
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

// 유저 카운트 
function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    
    socket.on("enter_room", (roomName,done) => {
        // 방 만들기 
        socket.join(roomName);
        done();

        // 방 입장시, 전체글 보내기 
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));

        // 방 생성  
        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 유저 퇴장
    // disconnecting 이벤트는 socket이 방을 떠나기 바로 직전에 발생한다. 
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => 
        socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));      // -1을 하는 이유는 : disconnecting이기때문에! 
    });

    // disconnect 이벤트는 socket이 방을 떠나면 바로 발생한다. 
    socket.on("disconnect", () => {
        // 방 생성  
        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 본인이 보낸 메시지 확인 
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    // 닉네임
    socket.on("nickname", nickname => socket["nickname"] = nickname);
});

/* Socket IO를 사용하면서 WebSocket에 사용하던 이벤트 함수는 주석처리 완 
import { type } from "os";
import WebSocket from "ws";

// websocket 프로토콜 서버 
const wss = new WebSocket.Server({ server });

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
                //닉네임 프로퍼티를 socket object에 저장하고 있음 
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickName} : ${message.payload.toString('utf8')}`));
            case "nickName":
                socket["nickName"] = message.payload.toString('utf8');
        }
    });
}); */

const handleListen = () => console.log(`Listening on http://localhost:3000`); //app.listen(3000, handleListen);
httpServer.listen(3000, handleListen);

{
    type:"message";
    payload:"hi everyone!";
}

{
    type:"nickName";
    payload:"anna";
}