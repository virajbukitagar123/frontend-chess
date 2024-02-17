import { useState } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import { over } from "stompjs";
import SockJS from 'sockjs-client'
import {
  Button, ButtonGroup, Input, VStack, Wrap, WrapItem,
  FormControl, Text, GridItem, Grid, Container, Box, Heading
} from '@chakra-ui/react'



var stompClient = null;
const SOCKET_URL = 'http://localhost:8080/ws-message';


export default function ChessRecord() {
  const [game, setGame] = useState(new Chess());
  const [message, setMessage] = useState('You server message here.');
  const [title, setTitle] = useState("");

  let sendMoveToServer = (fromSq, prevFen, toSq, newFen) => {
    if (stompClient) {
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
    if (stompClient) {
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
    var prevFen = game.fen()
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
    safeGameMutate(game => { game.reset() });
    setTitle("")
  }

  return (
    <Grid
      templateAreas={`"header"
                "main"`}
      gridTemplateRows={'75px auto'}
      gridTemplateColumns={'100vw'}
      h='100vh'
      gap='1'
      color='blackAlpha.700'
      fontWeight='bold'>
      <GridItem pl='2' area={'header'}>
        <Heading>Record Chess Page</Heading>
      </GridItem>
      <GridItem pl='2' area={'main'}>
        <VStack
          spacing={1}
          align='stretch'>
          <Box h='20px'>
            <FormControl onSubmit={handleSubmit}>
              <Wrap spacing='15px' padding={'5px'} justify={'center'}>
                <WrapItem>
                  <Box>
                    <Input type="text" id="Opening Name" name="title"
                      placeholder='Opening Name' size={'sm'} rounded={'full'} width={'350px'} value={title || ""} onChange={handleChange}></Input>
                  </Box>
                </WrapItem>
                <WrapItem>
                  <Box>
                    <ButtonGroup variant='outline' spacing='2' size={'sm'}>
                      <Button type='submit' colorScheme='blue' variant='solid' rounded={'full'}>Submit</Button>
                      <Button colorScheme="red" onClick={handleStop} variant='solid' rounded={'full'}>Stop</Button>
                    </ButtonGroup>
                  </Box>
                </WrapItem>
              </Wrap>
            </FormControl>
          </Box>
          <Container h='70vh' maxWidth={'100vw'} centerContent paddingTop={'30px'}>
            <Container h={'750px'} w={'750px'} centerContent>
              <Chessboard position={game.fen()} onPieceDrop={onDrop} /></Container>
          </Container>
          <Container h='40px' centerContent>
            <Text>{message}</Text>
          </Container>
        </VStack>
      </GridItem>
    </Grid>
  )
}