import { Flex, Box, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export default function NavBar() {
    return (<Flex
        as="nav"
        align="center"
        justify="space-between"
        padding="1rem"
        bg="blue.500"
        color="white"
    >
        <Box>
            <Text fontSize="xl" fontWeight="bold">
               Chess Openings
            </Text>
        </Box>
        <Box>
            <Link to="/" style={linkStyle}>Record</Link>
            <Link to="/play" style={linkStyle}>Play</Link>
        </Box>
    </Flex>
    )
}

const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    margin: '0 10px',
    fontSize: '1.2rem',
    fontWeight: 'bold'
};