import { Box, Input, Stack, Button, Text, InputGroup, InputRightElement, Avatar, FormControl } from '@chakra-ui/react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import { server } from '../configs/serverURl'
import { defaultPic } from '../configs/userConfigs';
import { handleFileUpload } from '../configs/handleFileUpload';

function Login({ value, inputValues, setInputValues }) {

  const navigate = useNavigate();

  const { showToast } = ChatState();

  const handleChange = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value })
  }

  const [pic, setPic] = useState(null)
  const [loading, setLoading] = useState(false)

  const HandleUpload = async (e) => {

    let avatar = await handleFileUpload(e, setLoading, showToast)
    setPic(avatar)
  }

  const handleSubmit = async (e) => {

    if(e.key === "Enter" || e.target.type === "button"){
        const { name, email, password, confpass } = inputValues
    
        if ((value !== "login" && (!name || !confpass)) || !email || !password) {
          return showToast("*Required", "Please fill all the fields marked with *", "error", 3000)
        }
        if (!email.includes("@gmail.com")) return showToast("*Invalid", "Email must be valid!", "error", 3000)
    
        if (value !== "login" && (password !== confpass)) {
          return showToast("*Missmathched", "Password and ConfirmPassword must be same.", "error", 3000)
        }
    
        try {
          setLoading(true)
          let avatar = pic ? pic : ""
          let payload = value === "login" ? JSON.stringify({ email, password }) : JSON.stringify({ name, email, password, avatar })
          const config = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: payload
          }
          let res = await fetch(`${server.URL.local}/api/user/${value === "login" ? "login" : "createuser"}`, config);
          let json = await res.json();
    
          if (!json.status) {
            showToast("Alert!", json.message, "error", 4000)
          } else {
            value !== "login" ?
              showToast("Whooho!", "We've created an account for your welcome to [Talk-o-Meter]", "success", 4000)
              : showToast("Welcome", json.message, "success", 4000)
            localStorage.setItem('token', json.token)
            navigate('/chats')
          }
    
          setLoading(false)
        } catch (error) {
          showToast("Seems some suspicious*", "Some error occured try again later", "error", 3000)
          setLoading(false)
        }
    }

  }

  const [show, setShow] = React.useState(false)
  const handleClick = () => setShow(!show)

  return (
    <Box  paddingBottom="1.5rem">
      <Stack spacing={6}>
      <FormControl onKeyDown={handleSubmit} display={"flex"} flexDir="column" gap={7}>
        {value !== "login" && <Box>
          <label style={{ margin: "20px 3px", fontSize: "1rem", fontWeight: "300", color: "grey" }} htmlFor="pass "><span className='red'>*</span> Fullname</label>
          <Input onChange={handleChange} value={inputValues?.name || ""} id="pass" name='name' variant='filled' placeholder='Fullname' />
        </Box>}
        <Box>
          <label style={{ margin: "20px 3px", fontSize: "1rem", fontWeight: "300", color: "grey" }} htmlFor="email"><span className='red'>*</span> Email</label>
          <Input onChange={handleChange} name='email' value={inputValues?.email || ""} id="email" variant='filled' placeholder='Email' />
        </Box>
        <Box>
          <label style={{ margin: "20px 3px", fontSize: "1rem", fontWeight: "300", color: "grey" }} htmlFor="pass "><span className='red'>*</span> Password</label>
          <InputGroup size='md'>
            <Input
              variant="filled"
              onChange={handleChange}
              name='password'
              id="pass"
              pr='4.5rem'
              value={inputValues.password ? inputValues.password : ""}
              type={show ? 'text' : 'password'}
              placeholder='Enter password'
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
        {value !== "login" && <Box>
          <label style={{ margin: "20px 3px", fontSize: "1rem", fontWeight: "300", color: "grey" }} htmlFor="pass "><span className='red'>*</span> ConfirmPassword</label>
          <InputGroup size='md'>
            <Input
              onChange={handleChange}
              value={inputValues?.confpass || ""}
              name='confpass'
              id="pass"
              variant="filled"
              pr='4.5rem'
              type={show ? 'text' : 'password'}
              placeholder='Enter confirmPassword'
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>}
        {value !== "login" && <>
          <input onChange={HandleUpload} accept="image/*" style={{ display: "none" }} id="icon-button-file" type="file" />
          <Box display={"flex"} justifyContent="space-between" alignItems={"center"}>
            <Avatar name='A V' src={pic ? pic : defaultPic} />
            <Text><b>Upload your profile picture </b></Text>
            <img width={25} src="https://cdn-icons-png.flaticon.com/512/556/556130.png" alt="handPointer" />
            <label style={{ cursor: "pointer" }} htmlFor="icon-button-file">
              <img width={30} src="https://cdn-icons-png.flaticon.com/512/1177/1177911.png" alt="Upload pic" /></label>
          </Box>
        </>}
          <Button width={"100%"} isLoading={loading} onClick={handleSubmit} colorScheme='teal' size='md'>
            {value === "login" ? "Login" : "SignUp"}
          </Button>
        </FormControl>
      </Stack>
      <Box display="flex" flexDir="column" alignItems="center" gap={20} marginTop="30px">
        <Text position="relative" borderBottom="1px solid" w="100%" paddingBottom="1rem">
          <div className="chaticon">
            <img alt='icon' width={100} src='https://cdn-icons-png.flaticon.com/512/3845/3845696.png'></img>
          </div>
        </Text>
      </Box>
    </Box>
  )
}

export default Login
