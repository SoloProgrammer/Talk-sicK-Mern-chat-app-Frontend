import { Route, Routes } from 'react-router-dom';
import './App.css';
import Chatpage from './pages/Chatpage';
import Homepage from './pages/Homepage';
import './components/componentCSS.css'

function App() {

  return (
    <>
      <div className="App">
        <Routes>
          <Route exact path='/' element={<Homepage />} />
          <Route exact path='/chats' element={<Chatpage />} />
          <Route exact path='/chats/archived' element={<Chatpage />} />
          <Route exact path='/chats/chat/:chatId' element={<Chatpage />} />
          <Route exact path='/chats/chat/:chatId/view/:senderId/image' element={<Chatpage />} />
          <Route exact path='*' element={<Chatpage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
