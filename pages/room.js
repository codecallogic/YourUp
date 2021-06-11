import spotifyService from './spotifyService'
import withUser from './withUser'
import {useEffect, useState} from 'react'
import io from "socket.io-client";
import {SOCKET} from '../config'

const socket = io.connect(SOCKET, {transports: ['websocket', 'polling', 'flashsocket']});

const Room = ({newUser}) => {

  const [inviteModal, setInviteModal] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(null)

  useEffect(() => {
    socket.emit('online', {displayName: newUser.displayName, photoURL: newUser.photoURL, email: newUser.email})
    
    socket.on('online', (users) => {
      setOnlineUsers(users)
    })
    
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
    
  }, [])

  const showAllOnlineUsers = () => {
    setInviteModal(!inviteModal)
  }
  
  return (
    <div className="room-container">
      <div className="room">
        <a href="/mixer">Leave</a>
        <div className="room-title">Name your room</div>
        <form className="form">
          <div className="form-group-single">
            <input type="text" placeholder="Room Name"/>
          </div>
          <div className="form-group-double">
            <label htmlFor="">Mode</label>
            <div className="form-group-double-container">
              <button>Back to Back</button>
              <button>Everyone's a DJ</button>
            </div>
          </div>
        </form>
        <div className="room-users">
          <div className="room-users-title">Who's in</div>
          <div className="room-users-selection">
              <img src={newUser ? newUser.photoURL : null}></img>
              <div className="room-users-selection-svg">
                <svg onClick={showAllOnlineUsers}><use xlinkHref="sprite.svg#icon-add-solid"></use></svg>
                {inviteModal && 
                <div className="room-users-selection-container">
                  <div className="room-users-selection-online-container">
                    {onlineUsers && onlineUsers.map((user, idx) => 
                      <div key={idx} className="room-users-selection-online">
                        <img src={user.photo}/>
                        <span>{user.name}</span>
                      </div>
                    )
                    }
                  </div>
                  <div className="room-users-selection-offline-container">
                    <div className="room-users-selection-offline">
                      <div className="room-users-selection-offline-title">Not online? Send an invite.</div>
                      <div className="room-users-selection-offline-invite">
                        <input type="tel" placeholder="+1-323-1582-4918"/>
                        <div><svg><use href="sprite.svg#icon-paperplane"></use></svg></div>
                      </div>
                    </div>
                  </div>
                </div>
                }
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default spotifyService(withUser(Room))
