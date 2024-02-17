import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import ChessRecord from './ChessRecord';
import ChessPlay from './ChessPlay';
import TestWS from './TestWS';
import { ChakraProvider } from '@chakra-ui/react'

export default function MainPage() {
 return (
  <ChakraProvider>
  <Router>  
  <Routes>
    <Route path="/" element={<ChessRecord />} />
    <Route path="/play" element={<ChessPlay />} />
    <Route path="/testws" element={<TestWS />} />
  </Routes>
</Router>
</ChakraProvider>
);
}