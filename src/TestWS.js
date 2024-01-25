import { useState } from "react";
import {over} from "stompjs";
import SockJS from 'sockjs-client'

var stompClient = null;
const SOCKET_URL = 'http://localhost:8080/ws-message';

export default function TestWS() {

    const [message, setMessage] = useState('You server message here.');
    const [title, setTitle] = useState("");

    let onConnected = () => {
        stompClient.subscribe('/topic/message', onMessageReceived);
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

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked on Submit")
        console.log("Value was " + title);
        startSocket();
    }

    let sendMessageToServer = (msgPayload) => {
        if(stompClient) {
            let messageToSend = {
                message: msgPayload
            }
            stompClient.send("/app/sendMessage", {}, JSON.stringify(messageToSend))
        }
    }

    let sendMessageButton = () => {
        sendMessageToServer("Hi Bye Viraj");
    }

    function handleChange(e) {
        setTitle(e.target.value)
        console.log(title)
    }
    
    return (
        <div>
          <div>{message}</div>
          <br></br>
          <form onSubmit={handleSubmit}>
            <label>Title:  
            <input type="text" id="Opening Name" name="title" value={title || ""} onChange={handleChange}></input>
            <button type="button" onClick={sendMessageButton}>Send</button>
            </label>
            <button type="submit">Submit</button>
        </form>
        </div>
      );
}