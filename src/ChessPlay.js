import { useState, useEffect } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import ReloadableGif from "./ReloadableGif";
// import GifPlayer from "react-gif-player";
import {
  GridItem, Grid, Container, Box, SimpleGrid, Spinner
} from '@chakra-ui/react'



export default function ChessPlay() {
  const [game, setGame] = useState(new Chess());
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [curFen, setCurFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  const [moveNum, setMoveNum] = useState(1);

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    console.log(move);
    console.log(gameCopy);
    return result;
  }

  const fetchData = async (fen) => {
    try {
      const response = await fetch('http://localhost:8080/getOpenings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "message": fen }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      setData(await response.json());
      setIsLoading(false);
      console.log('Data:', data);
      // Do something with the data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function onDrop(sourceSquare, targetSquare) {
    setIsLoading(true);
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    // illegal move
    if (move === null) return false;
    setMoveNum(moveNum + 1);
    console.log("Current Fen: ", game.fen())
    setCurFen(game.fen());
    fetchData(game.fen());
    console.log('Data after fetch: ', data);
    return true;
  }

  // To run it only one time once the page is loaded.
  useEffect(() => {
    if (data.length === 0 && moveNum === 1) {
      fetchData(curFen);
    }

  }, []);

  return (
    <Grid templateAreas={`"nav main"`}
      gridTemplateRows={'100vh'}
      gridTemplateColumns={'45vw 55vw'}
      w='100vw'
      gap='1'
      color='blackAlpha.700'
      fontWeight='bold'>

      <GridItem pl='2' area={'nav'}>
        <Container h='750px' maxWidth={'100vw'} centerContent paddingTop={'30px'}>
          <Container h={'750px'} w={'750px'} centerContent>
            <Chessboard position={game.fen()} onPieceDrop={onDrop} />
          </Container>
        </Container>
      </GridItem>
      <GridItem pl='2' area={'main'}>
        <Container padding={'15px 5px 15px 5px'} margin={'20px'} w='630px'>
          <SimpleGrid columns={2} spacing={10}>
            {isLoading ? (
              <Spinner size="lg" />
            ) : (
              (() => {
                const boxes = [];
                for (let i = 0; i < data.length; i++) {
                  console.log("Opening Name: " + data[i]);
                  boxes.push(
                    <Box key={i} height='300px'>
                      <ReloadableGif opening={data[i]} moveNum={moveNum} />
                      <strong>{data[i]}</strong>
                    </Box>
                  );
                }
                console.log("Boxes: " + boxes);
                return boxes;
              })()
            )}
          </SimpleGrid>
        </Container>
      </GridItem>
    </Grid>
  )
}