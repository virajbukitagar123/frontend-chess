import { useState } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import {over} from "stompjs";
import SockJS from 'sockjs-client'



var stompClient = null;
const SOCKET_URL = 'http://localhost:8080/ws-message';


export default function ChessRecord() {
  const [game, setGame] = useState(new Chess());
  const [message, setMessage] = useState('You server message here.');
  const [title, setTitle] = useState("");

  let sendMessageToServer = (msgPayload) => {
    if(stompClient) {
        let messageToSend = {
            message: msgPayload
        }
        stompClient.send("/app/sendMessage", {}, JSON.stringify(messageToSend))
    }
}

  let onConnected = () => {
      stompClient.subscribe('/topic/message', onMessageReceived);
      sendMessageToServer("Hi opening is: " + title);
      console.log("Connected!!")
  }

  let onMessageReceived = (payload) => {
      let payloadData = JSON.parse(payload.body);
      console.log(payloadData.message);
      setMessage(payloadData.message);
  }

  let onError = (err) => {
      console.log(err)
  }

  function startSocket() {
    let Sock = new SockJS(SOCKET_URL);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
}


  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    console.log(move);
    console.log(gameCopy);
    sendMessageToServer(move);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return; // exit if the game is over
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    setTimeout(makeRandomMove, 200);
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("You clicked on Submit")
    console.log("Value was " + title);
    startSocket();
}

function handleChange(e) {
    setTitle(e.target.value)
    console.log(title)
}

  return (
      <div style={{
        height: 500,
        width: 500,
        margin: 50
      }}>
        <h2> Record Chesss Page</h2>
        <form onSubmit={handleSubmit}>
            <label>Title:  
            <input type="text" id="Opening Name" name="title" value={title || ""} onChange={handleChange}></input>
            </label>
            <button type="submit">Submit</button>
        </form>
        <br></br>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      <div>{message}</div>
      </div> 
     )
}