import React, { useContext, useMemo } from 'react'
import { io } from 'socket.io-client';
import { createContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = ()=>{
    const socket = useContext(SocketContext);
    return socket;
}


const SocketProvider = (props) => {
  //creating new socket 
const socket = useMemo ( ()=> io("localhost:8000"),[] );

  return (
    <SocketContext.Provider value={socket}>
        {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider