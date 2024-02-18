import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import ChessRecord from './ChessRecord';
import ChessPlay from './ChessPlay';
import { ChakraProvider } from '@chakra-ui/react'
import NavBar from './NavBar';

export default function MainPage() {
 return (
  <ChakraProvider>
    <Router>
    <NavBar />
    <Routes>  
    <Route path="/" element={<ChessRecord />} />
    <Route path="/play" element={<ChessPlay />} />
  </Routes>
</Router>
</ChakraProvider>
);
}