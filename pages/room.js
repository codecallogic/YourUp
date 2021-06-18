import spotifyService from './spotifyService'
import withUser from './withUser'
import {useEffect, useState} from 'react'
import io from "socket.io-client";
import {API, DOMAIN, SOCKET} from '../config'
import axios from 'axios'

const socket = io.connect(SOCKET, {transports: ['websocket', 'polling', 'flashsocket']});

const Room = ({newUser}) => {

  const [inviteModal, setInviteModal] = useState(false)
  const [inviteMessageModal, setInviteMessageModal] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteFrom, setInviteFrom] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(null)
  const [room, setRoom] = useState('')
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [group, setGroup] = useState([])

  useEffect(() => {
    socket.emit('online', {displayName: newUser.displayName, photoURL: newUser.photoURL, email: newUser.email}, (id) => {
      newUser.id = id
      // newUser.photo = newUser.photoURL
      setGroup( prevState => [...prevState, newUser])
    })
    
    socket.on('online', (users) => {
      setOnlineUsers(users)
    })

    socket.on('invite', (data) => {
      setInviteModal(false)
      setInviteMessageModal(true)
      setInviteMessage(data.msg)
      setInviteFrom(data.from)
      setCurrentUser(data.currentUser)
    })

    socket.on('addToGroup', (user) => {
      setGroup(prevState => [...prevState, user])
    })
    
    socket.on('pending', (data) => {
      document.getElementById(data.id).classList.remove('pending')
    })

    socket.on('redirect', (redirect) => {
      if(redirect) window.location.href = '/mixer'
    })
    
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [])

  const showAllOnlineUsers = () => {
    setInviteModal(!inviteModal)
  }

  const sendInvite = async () => {
    let message = `${newUser.displayName} has invited you to join in on a DJ mixer live room. You can join by visiting ${DOMAIN} and tapping on create a room, someone will add you or you can create a room with others online.`

    try {
      const responseInvite  = await axios.post(`${API}/message/invite`, {toUser: `+${number}`, message})
      console.log(responseInvite)
    } catch (error) {
      console.log(error)
    }
  }

  const createRoom = () => {
    if(room.length > 0){
      group.forEach((item) => {
        item.room = room
        return item
      })

      socket.emit('rooms', {room}, (data) => {
        if(data.error) return setMessage(data.error)
        group.forEach((item) => {
          if(item.email !== newUser.email) socket.emit('redirect', item.id)
        })
        window.localStorage.setItem('group', JSON.stringify(group))
        window.localStorage.setItem('room', data.room)
        window.location.href = '/mixer'
      })
    }else{
      setMessage('Please enter a name for the room.')
    }
  }
  
  return (
    <div className="room-container">
      <div className="room">
        <div className="room-title">Name your room</div>
        <form className="form">
          <div className="form-group-single">
            <input type="text" placeholder="Room Name" name="room" value={room} onChange={(e) => (setRoom(e.target.value), setMessage(''))}/>
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
              <div className="room-users-selection-picked">
                {group.length > 0 && group.map((item, idx) =>
                  <img key={idx} src={item.photoURL}></img>
                )}
              </div>
              <div className="room-users-selection-svg">
                <svg onClick={showAllOnlineUsers}><use xlinkHref="sprite.svg#icon-add-solid"></use></svg>
                {inviteModal && 
                <div className="room-users-selection-container">
                  <div className="room-users-selection-online-container">
                    {onlineUsers && onlineUsers.length > 1 && onlineUsers.filter((item) => item.email !== newUser.email).map((user, idx) => 
                      <div key={idx} id={user.id} className="room-users-selection-online" onClick={(e) => (e.target.classList.add('pending'), socket.emit('group-invite', {user, newUser}))}>
                        <img src={user.photoURL}/>
                        <span>{user.name}</span>
                      </div>
                    )
                    }
                    {onlineUsers && onlineUsers.length == 1 && <span className="room-users-selection-online-zero">Users are currently offline</span>}
                  </div>
                  <div className="room-users-selection-offline-container">
                    <div className="room-users-selection-offline">
                      <div className="room-users-selection-offline-title">Send an invite.</div>
                      <div className="room-users-selection-offline-invite">
                        <input type="tel" placeholder="1 323 1582 4918" name="number" value={number} onChange={(e) => setNumber(e.target.value)}/>
                        <div onClick={sendInvite}><svg><use href="sprite.svg#icon-paperplane"></use></svg></div>
                      </div>
                      {message && <div className="room-users-selection-offline-invite-message">{message}</div>}
                    </div>
                  </div>
                </div>
                }
                {inviteMessageModal && 
                <div className="room-users-invitation-container">
                  <div className="room-users-invitation-message">{inviteMessage}</div>
                  <div className="room-users-invitation-buttons">
                    <button onClick={() => (setGroup( prevState => [...prevState, inviteFrom]), socket.emit('remove-user', {user: currentUser, from: inviteFrom}), setInviteMessageModal(false))}>Accept</button>
                    <button onClick={() => (setInviteMessageModal(false), setInviteMessage(''), setInviteFrom(''), socket.emit('remove-pending', {user: currentUser, from: inviteFrom}))}>Decline</button>
                  </div>
                </div>
                }
              </div>
          </div>
        </div>
        <button className="room-button" onClick={createRoom}>Create Session</button>
        {message && <div className="room-users-selection-offline-invite-message">{message}</div>}
      </div>
    </div>
  )
}

export default spotifyService(withUser(Room))
