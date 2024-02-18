import { useState, useMemo } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
// import ReloadableGif from "./ReloadableGif";
// import GifPlayer from "react-gif-player";
import {
  GridItem, Grid, Container, Box, SimpleGrid, Spinner
} from '@chakra-ui/react'



export default function ChessRecord() {
  const [game, setGame] = useState(new Chess());
  const [data, setData] = useState([]);
  const [curFen, setCurFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [isLoading, setIsLoading] = useState(true);

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    console.log(move);
    console.log(gameCopy);
    return result;
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    // illegal move
    if (move === null) return false;
    setCurFen(game.fen());
    return true;
  }

  useMemo(() => {
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

    fetchData(curFen);

  }, [curFen, data]);

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
          <SimpleGrid columns={2} spacing={5}>
            {isLoading ? (
              <Spinner size="lg" />
            ) : (
              (() => {
                const boxes = [];
                for (let i = 0; i < data.length; i++) {
                  boxes.push(
                    <Box key={i} height='300px'>
                      <strong>{data[i]}</strong>
                    </Box>
                  );
                }
                return boxes;
              })()
            )}
          </SimpleGrid>
        </Container>
      </GridItem>
    </Grid>
  )
}