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
  const [room_mode, setRoomMode] = useState('')
  const [room_created, setRoomCreated] = useState(false)
  const [in_group, setInGroup] = useState(false)

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
      setInviteModal(false)
    })
    
    socket.on('pending', (data) => {
      if(inviteModal) document.getElementById(data.id).classList.remove('pending')
    })

    socket.on('redirect', (redirect) => {
      if(redirect) window.location.href = '/mixer'
    })
    
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [])

  const sendInvite = async () => {
    let message = `${newUser.displayName} has invited you to join in on a DJ mixer live room. You can join by visiting ${DOMAIN} and tapping on create a room, someone will add you to a group or you can create a room with others online.`

    try {
      const responseInvite  = await axios.post(`${API}/message/invite`, {toUser: `+${number}`, message})
      setMessage(responseInvite.data.data ? responseInvite.data.data.to[0] ? `Message was sent to ${responseInvite.data.data.to[0].phone_number}` : 'Message was sent' : 'Message was sent.')
      setNumber('')
    } catch (error) {
      if(error) setMessage(error.response ? error.response.data : 'Invalid number, please try again.'); setNumber('')
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
        window.localStorage.setItem('room', JSON.stringify(data.room))
        window.localStorage.setItem('mode', JSON.stringify(room_mode))
        window.location.href = '/mixer'
      })
    }else{
      setMessage('Please enter a name for the room.')
    }
  }
  
  return (
    <div className="room-container">
      <div className="room">
        {!in_group && <>
        <div className="room-title">Name your room</div>
        <form className="form">
          <div className="form-group-single">
            <input type="text" placeholder="Room Name" name="room" value={room} onChange={(e) => (setRoom(e.target.value), setMessage(''))}/>
          </div>
          <div className="form-group-double">
            <label htmlFor="">Mode</label>
            <div className="form-group-double-container">
              <button onClick={(e) => (e.preventDefault(), setRoomMode('back_to_back'))} className={(room_mode == 'back_to_back' ? `room-mode` : '')}>Back to Back</button>
              <button onClick={(e) => (e.preventDefault(), setRoomMode('everyone'))} className={(room_mode == 'everyone' ? `room-mode` : '')}>Everyone's a DJ</button>
            </div>
          </div>
        </form>
        </>
        }
        <div className="room-users">
          <div className="room-users-title">Who's in</div>
          <div className="room-users-selection">
              <div className="room-users-selection-picked">
                {group.length > 0 && group.map((item, idx) =>
                  <img key={idx} src={item.photoURL}></img>
                )}
              </div>
              <div className="room-users-selection-svg">
                {!inviteMessageModal && <svg onClick={ () => setInviteModal(!inviteModal)}><use xlinkHref={!inviteModal ? `sprite.svg#icon-add-solid` : `sprite.svg#icon-cancel-circle`}></use></svg>}
                {inviteModal && 
                <div className={`room-users-selection-container ` + (in_group ? `room-in_group` : '')}>
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
                    <button onClick={() => (setGroup( prevState => [...prevState, inviteFrom]), socket.emit('remove-user', {user: currentUser, from: inviteFrom}), setInviteMessageModal(false), setInGroup(true))}>Accept</button>
                    <button onClick={() => (setInviteMessageModal(false), setInviteMessage(''), setInviteFrom(''), socket.emit('remove-pending', {user: currentUser, from: inviteFrom}))}>Not now</button>
                  </div>
                </div>
                }
              </div>
          </div>
        </div>
        {!in_group && <button className="room-button" onClick={() => setRoomCreated(true)}>Create Session</button>}
        {in_group && <span className="room-wait">Waiting for room to be created</span>}
        {message && <div className="room-users-selection-offline-invite-message">{message}</div>}
        {room_created &&
        <div className="room-created">
          <img src="/media/group_created.png" />
          <div className="room-created-title">Group Created</div>
          <div className="room-created-subtitle">All members must have a premium account to play and listen to music.</div>
          <button className="room-created-button" onClick={createRoom}>Nice one, your in</button>
        </div>
        }
      </div>
    </div>
  )
}

export default spotifyService(withUser(Room))
