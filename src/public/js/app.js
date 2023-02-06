const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 방 입장 전에 메시지 보내기 기능 숨기기 
room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
};

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value.toString('utf8');
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
};

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");  
    socket.emit("nickname", input.value.toString('utf8'));
    input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `방 이름: ${roomName}`;

    // form 이용하며 백엔드로 메시지 보내기 
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
};

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");

    // 백엔드로 메시지 전송 후, showRoom 함수 호출 
    socket.emit("enter_room", input.value.toString('utf8'), showRoom);
    roomName = input.value;
    input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

// 유저 입장 메시지 
socket.on("welcome", (user) => {
    addMessage(`${user}가 입장했습니다.`);
});

// 유저 퇴장 메시지
socket.on("bye", (left) => {
    addMessage(`${left}가 퇴장했습니다 ㅠㅠ`);
});

// 유저의 새로운 메시지
socket.on("new_message", addMessage);