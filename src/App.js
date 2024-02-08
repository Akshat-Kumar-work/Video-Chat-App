
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Lobby from './screens/Lobby';
import Room from './screens/Room';

function App() {
  return (
    <div>
          <Routes>
            <Route path='/' element={<Lobby/>} ></Route>
            <Route path='/room/:roomId' element={<Room/>}/>
          </Routes>
    </div>
  );
}

export default App;
