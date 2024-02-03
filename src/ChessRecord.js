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

  let sendMoveToServer = (fromSq, prevFen, toSq, newFen) => {
    if(stompClient) {
        let messageToSend = {
            prevPos: prevFen,
            newPos: newFen, 
            from: fromSq,
            to: toSq
        }
        stompClient.send("/app/sendChessMove", {}, JSON.stringify(messageToSend))
    }
  }

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
      sendMessageToServer("Start-" + title);
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
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function onDrop(sourceSquare, targetSquare) {
    var prevFen =  game.fen()
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    var newFen = game.fen()

    // illegal move
    if (move === null) return false;
    sendMoveToServer(sourceSquare, prevFen, targetSquare, newFen);
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

function safeGameMutate(modify) {
  setGame((g) => {
    const update = { ...g };
    modify(update);
    return update;
  });
}

function handleStop(e) {
  sendMessageToServer("Stop")
  safeGameMutate(game => {game.reset()});
  setTitle("")
}

  return (
      <div style={{
        height: 500,
        width: 500,
        margin: 50
      }}>
        <h2> Record Chess Page</h2>
        <form onSubmit={handleSubmit}>
            <label>Title:  
            <input type="text" id="Opening Name" name="title" value={title || ""} onChange={handleChange}></input>
            </label>
            <button type="submit">Submit</button>
            <button type="button" onClick={handleStop}>Stop</button>
        </form>
        <br></br>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      <div>{message}</div>
      </div> 
     )
}