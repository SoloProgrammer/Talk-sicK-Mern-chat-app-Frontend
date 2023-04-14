import React, { useState, useEffect } from 'react'
import UserauthForm from '../components/UserauthForm';
import { Container, Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import BrandLogo from '../utils/BrandLogo';
import { useNavigate } from 'react-router-dom';

function Homepage() {

    const navigate = useNavigate()
    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) navigate('/chats');

        setTimeout(() => document.querySelector('.userForm')?.classList.remove('hide'), 0);
    }, [navigate])
    const [inputValues, setInputValues] = useState({});
    
    return (
        
        <Container className={`userForm  hide`} transition={".5s"} maxW="md" pos={"fixed"} right={0} minH={{ base: "fit-content", md: "100vh" }} bg="white" boxShadow={"0 0 10px rgba(0,0,0,.2)"}>
            <Box p={"2rem 0 1rem 0"} w="100%" margin={"auto"} display="flex" justifyContent={"center"}>
                <BrandLogo />
            </Box>
            <Box bg={"white"} >
                <Tabs isFitted colorScheme="teal" onChange={() => setInputValues({})} >
                    <TabList>
                        <Tab>Login</Tab>
                        <Tab>SignUp</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <UserauthForm setInputValues={setInputValues} inputValues={inputValues} value="login" />
                        </TabPanel>
                        <TabPanel>
                            <UserauthForm setInputValues={setInputValues} inputValues={inputValues} value="signUp" />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

        </Container>
    )
}

export default Homepage
