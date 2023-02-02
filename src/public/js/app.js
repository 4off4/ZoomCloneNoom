const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);     // JSON Oject를 string으로 변환 
}

/* 백엔드 -> 프론트엔드로 메시지 보내기 */
// function 메시지 정리
function handleOpen() {
    console.log("Connected to Server!");
}

function handleClose() {
    console.log("Disconnected from server!");
}

// 서버와 연결 되었을 때 발생 
socket.addEventListener("open", handleOpen);

// 서버로부터 메시지를 받을 때 발생 
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerHTML = message.data;
    messageList.append(li);
});

// 서버와 연결이 끊겼을 때 발생 
socket.addEventListener("close", handleClose);

// 프론트 메시지 
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");

    // 백엔드로 input값 전송 
    socket.send(makeMessage("new_message", input.value));

    // socket으로 보낸 후 input 초기화  
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);

// 프론트 닉네임 
function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");

    // 백엔드로 전송 
    socket.send(makeMessage("nickName", input.value));

    // socket으로 보낸 후 input 초기화  
    input.value = "";
}
nickForm.addEventListener("submit", handleNickSubmit);