import {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import {API, SOCKET} from '../config'
import spotifyService from './spotifyService'
import withUser from './withUser'
import firebase from 'firebase'
import axios from 'axios'
import io from "socket.io-client";

const socket = io.connect(SOCKET, {transports: ['websocket', 'polling', 'flashsocket']});

const Mixer = ({newToken, invalidToken, spotifyData, newUser}) => {

  // console.log(newUser)

  const [user, setUser] = useState(null)
  const [dataExists, setDataExists] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(spotifyData.currentPlaybackState ? spotifyData.currentPlaybackState.item : null)
  const [device, setDevice] = useState(spotifyData.currentPlaybackState ? spotifyData.currentPlaybackState.is_playing : null)

  // TRACK SETTINGS
  const [nextTrack, setNextTrack] = useState(spotifyData.track ? spotifyData.track.tracks[0] : null)
  const [counter, setCounter] = useState(0)
  const [controls, setControls]  = useState(true)
  const [ripples, setRipples]  = useState(null)
  const [shake, setShake] = useState(null)

  // ROOM DATA
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState(false)
  const [error, setError] = useState('')

  // SOCKET DATA
  const [group, setGroup] = useState([newUser])
  const [activeRoom, setActiveRoom] = useState(null)
  const [room_mode, setRoomMode] = useState(null)
  const [pin, setPin] = useState(null)
  const [join_room, setJoinRoom] = useState('')

  // MODALS
  const [roomNameModal, setRoomNameModal] = useState(false)
  const [join_room_modal, setJoinRoomModal] = useState(false)
   
  useEffect( () => {
    group.length == 0 ? setActiveRoom(null) : null
    invalidToken ? window.location.href = `/` : null

    Object.keys(spotifyData).length > 0 ? null : window.location.href = `${API}/spotify/login`
    Object.keys(spotifyData).length > 0 ? setDataExists(true) : null

    socket.on('get-room', (data) => {
      setGroup(data.group)
      setActiveRoom(data.room)
      setRoomMode(data.mode)
      setPin(data.pin)
      socket.emit('join-room', data.room)
    })

    socket.emit('online-mixer', {name: newUser.name, photoURL: newUser.photoURL, email: newUser.email}, (users) => {
      let isInArray = []
      let newRoom = null
      let mode = null
      let pin = null
      // console.log(users)
      if(JSON.parse(window.localStorage.getItem('group'))){
        JSON.parse(window.localStorage.getItem('group')).find((item) => {
          users.forEach( (el) => {
            if(item.mixing) el.mixing = true
            if(el.email == item.email) isInArray.push(el)
          })
        })

        newRoom = JSON.parse(window.localStorage.getItem('room'))
        mode = JSON.parse(window.localStorage.getItem('mode')) ? JSON.parse(window.localStorage.getItem('mode')) : null
        pin = JSON.parse(window.localStorage.getItem('pin')) ? JSON.parse(window.localStorage.getItem('pin')) : null
      }

      console.log(isInArray)

      if(isInArray.length !== 0){
        isInArray.forEach((item) => {
          item.room = newRoom
          item.mode = mode
          item.pin = pin
          socket.emit('send-room', {id: item.id, room: item.room, mode: item.mode, pin: item.pin, group: isInArray}, (data) => {
            console.log(data)
          })
        })
      }
      
      if(JSON.parse(window.localStorage.getItem('room'))) setActiveRoom(JSON.parse(window.localStorage.getItem('room')))
      if(isInArray.length > 0) setGroup([...isInArray])
    })


    socket.on('online-mixer', (users) => {
      let isInArray = []
      let newRoom = null
      let mode = null
      let pin = null
      // console.log(users)
      if(JSON.parse(window.localStorage.getItem('group'))){
        JSON.parse(window.localStorage.getItem('group')).find((item) => {
          if(users){
            users.forEach( (el) => {
            if(item.mixing == true) item.email == el.email ? el.mixing = true : null
            if(el.email == item.email) isInArray.push(el)
          })
          }
        })

        newRoom = JSON.parse(window.localStorage.getItem('room'))
        mode = JSON.parse(window.localStorage.getItem('mode')) ? JSON.parse(window.localStorage.getItem('mode')) : null
        pin = JSON.parse(window.localStorage.getItem('pin')) ? JSON.parse(window.localStorage.getItem('pin')) : null
      }

      console.log(isInArray)
      
      if(isInArray.length !== 0){
        isInArray.forEach((item) => {
          item.room = newRoom
          item.mode = mode
          item.pin = pin
          socket.emit('send-room', {id: item.id, room: item.room, mode: item.mode, pin: item.pin, group: isInArray}, (data) => {
            console.log(data)
          })
        })
      }
      console.log(JSON.parse(window.localStorage.getItem('room')))
      if(JSON.parse(window.localStorage.getItem('room'))) setActiveRoom(JSON.parse(window.localStorage.getItem('room')))
      if(isInArray.length !== 0) setGroup([...isInArray])
    })

    socket.on('play-song', (play) => {
      // console.log(play)
      playSong(play.uri, play.newCounter)
    })

    return () => {
      socket.emit("disconnect");
      socket.off();
    }
    
  }, [SOCKET])

  const signOut = async () => {
    try {
      const responseSignout = await axios.post(`${API}/spotify/remove-cookie`)
      firebase.auth().signOut()
      setUser(null)
      window.location.href = ('/')
    } catch (error) {
      console.log(error)
    }
  }

  const playSong = async (spotifyURI, newCounter) => {
    setNextTrack(spotifyData.track.tracks[newCounter])
    let activateDevice = localStorage.getItem('device')

    try {
      // const responseLowerVolume = await axios.put(`${API}/spotify/volume/decrease`, {newToken})
      const responsePlay = await axios.post(`${API}/spotify/play`, {spotifyURI, newToken, activateDevice})
      // const responseIncreaseVolume = await axios.put(`${API}/spotify/volume/increase`, {newToken})
      setCurrentTrack(responsePlay.data.item)
      setDevice(true)
    } catch (error) {
      console.log(error)
    }
  }

  const lowerControls = (e) => {
    if(e.target.className == 'mixer-controls-container'){setControls(!controls)}
    if(e.target.className == 'mixer-controls-toggle' ){setControls(!controls)}
    if(e.target.className.animVal == 'toggle' ){setControls(!controls)}
  }

  const onDragStart = (e, uri) => {
    e.dataTransfer.setData("uri", uri);
    setRipples(true)
    setShake(null)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDragEnterCurrent = (e) => {
    //
  }

  const onDragEnd = (e) => {
    setRipples(null)
  }

  const onDrop = async (e) => {
    let uri = e.dataTransfer.getData("uri");

    let newCounter = counter + 1

    newCounter < spotifyData.track.tracks.length ? setCounter(newCounter) : (setCounter(0), newCounter = 0);
    setRipples(null)
    setShake(true)

    let userInGroup = group[0]
    
    socket.emit('send-song', {userInGroup, uri, newCounter})
    playSong(uri, newCounter)
  }

  const fromStart = (uri) => {
    let newCounter = counter + 1

    newCounter < spotifyData.track.tracks.length ? setCounter(newCounter) : (setCounter(0), newCounter = 0);

    let userInGroup = group[0]
    
    socket.emit('send-song', {userInGroup, uri, newCounter})
    playSong(uri, newCounter)
  }

  const fromDrop = async (uri) => {
    try {
      const responseIncreaseVolume = await axios.put(`${API}/spotify/volume/decrease`, {newToken})

      let timesRunFirstInterval = 0;
      let firstRun = setInterval( async () => {

        const responseIncreaseVolume = await axios.put(`${API}/spotify/volume/increase`, {newToken})

        let newCounter = counter + 1
        newCounter < spotifyData.track.tracks.length ? setCounter(newCounter) : (setCounter(0), newCounter = 0);

        let userInGroup = group[0]
        socket.emit('send-song', {userInGroup, uri, newCounter})

        playSong(uri, newCounter)
        timesRunFirstInterval += 1;
        if(timesRunFirstInterval === 1){
          clearInterval(firstRun);
        }
  
        // console.log(responseIncreaseVolume)
      }, 1000)
    } catch (error) {
      console.log(error)
    }
  }

  const enterRoom = () => {
    socket.emit('enter-room', {pin: join_room}, (room) => {
      if(room.error) return setMessage(room.error)
      setGroup( prevState => [...group, ...room.group])
      setActiveRoom(room.room)
      setRoomMode(room.mode)
      setPin(room.pin)
      socket.emit('join-room', room.room)
    })
  }

  const handleText = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
        setJoinRoom(e.target.value)
    }
  }

  return (
    <div className="mixer-container">
      <div className="mixer">
        <div className="mixer-dj">
          <div className="mixer-dj-inTheMix">
            {group.length > 0 && group.map((item, idx) => (
              item.mixing ? <img key={idx} src={item.photoURL} alt="In The Mix"/> : null
            ))
            }
            <div>
              <span>In the Mix</span>
              <span>Now playing {activeRoom ? `in room ${activeRoom}` : null}</span>
            </div>
          </div>
          {activeRoom && <div className="mixer-dj-upNext">
            <span>Up next</span>
            <div className="mixer-dj-upNext-photos">
              {group && group.map((person, idx) => 
                <img key={idx} src={person.photoURL} alt=""/>
              )}
            </div>
          </div>
          }
          {!activeRoom &&   
            // TODO: Create function to join room if room exists and pin matches
            <div className="mixer-dj-button" onClick={() => setJoinRoomModal(true)}>Join Room</div>
          }
          {!activeRoom &&   
            <div className="mixer-dj-button" onClick={() => window.location.href = '/room'}>Create Room</div>
          }
        </div>
        <div className="mixer-track">
          <div className={`mixer-track-current shake` + (ripples ? 'pulse' : null) + (shake ? ' shake' : null)} onDrop={(e) => onDrop(e)} onDragOver={(e)=> onDragOver(e)} onDragEnter={(e) => onDragEnterCurrent(e)}>
            {Object.keys(spotifyData).length > 0 ? currentTrack && device ? <>
                <img src={invalidToken == false ? currentTrack.album.images[0].url : null} alt=""/>
                <span>{invalidToken == false ? currentTrack.artists[0].name : null}</span>
                <span>{invalidToken == false ? currentTrack.name : null}</span>
                {ripples == null && <div className="mixer-track-ripples-current">
                  <span style={{'--i': 1}}></span>
                  <span style={{'--i': 2}}></span>
                  <span style={{'--i': 3}}></span>
                  <span style={{'--i': 4}}></span>
                  <span style={{'--i': 5}}></span>
                  <span style={{'--i': 6}}></span>
                  <span style={{'--i': 7}}></span>
                  <span style={{'--i': 8}}></span>
                  <span style={{'--i': 9}}></span>
                  <span style={{'--i': 10}}></span>
                </div>
                }
                <div className="mixer-track-current-background">
                  <div className="mixer-track-current-background-container">
                    <span style={{'--i': 1}}></span>
                    <span style={{'--i': 2}}></span>
                    <span style={{'--i': 3}}></span>
                    <span style={{'--i': 4}}></span>
                    <span style={{'--i': 5}}></span>
                  </div>
                </div>
            </>
            :
            <span className="mixer-track-current-off">Ooops, a device is not currently active. Please play a song in a spotify device.</span>
            :
            <span className="mixer-track-current-off">Ooops, a device is not currently active. Please play a song in a spotify device.</span>
            }
          </div>
          <div className={`mixer-track-next ` + (ripples ? 'transparent' : null)} draggable onDragStart={(e) => onDragStart(e, nextTrack.uri)} onDragEnd={(e) => onDragEnd(e)}>
            <img src={Object.keys(spotifyData).length > 0 ? nextTrack.album.images[0].url : null} alt=""/>
            <span>{Object.keys(spotifyData).length > 0 ? nextTrack.artists[0].name : null}</span>
            <span>{Object.keys(spotifyData).length > 0 ? nextTrack.name : null}</span>
            {ripples !== null && <div className="mixer-track-ripples-next">
              <span style={{'--i': 1}}></span>
              <span style={{'--i': 2}}></span>
              <span style={{'--i': 3}}></span>
              <span style={{'--i': 4}}></span>
              <span style={{'--i': 5}}></span>
              <span style={{'--i': 6}}></span>
              <span style={{'--i': 7}}></span>
              <span style={{'--i': 8}}></span>
              <span style={{'--i': 9}}></span>
              <span style={{'--i': 10}}></span>
            </div>
            }
            <div className="mixer-track-next-background">
              <div className="mixer-track-next-background-container">
                <span style={{'--i': 1}}></span>
                <span style={{'--i': 2}}></span>
                <span style={{'--i': 3}}></span>
                <span style={{'--i': 4}}></span>
                <span style={{'--i': 5}}></span>
              </div>
            </div>
          </div>
        </div>
        <div className={`mixer-controls-container`} style={{height: controls == false ? `0% !important` : ` min-content `}} onClick={(e) => lowerControls(e)}>
          {controls ? 
          
          <div className="mixer-controls-toggle" onClick={(e) => lowerControls(e)}><svg className="toggle" onClick={(e) => lowerControls(e)}><use className="toggle" onClick={(e) => lowerControls(e)} xlinkHref="sprite.svg#icon-transit_enterexit"></use></svg></div>

          : 

          <div className="mixer-controls-toggle open" onClick={(e) => lowerControls(e)}><svg className="toggle" onClick={(e) => lowerControls(e)}><use className="toggle" onClick={(e) => lowerControls(e)} xlinkHref="sprite.svg#icon-open_in_full"></use></svg></div>

          }
          <div className={`mixer-controls` + (controls == false ? ` none hide` : ` show`)}>
            <svg className="mixer-controls-single" onClick={() => fromStart(nextTrack.uri)}><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
            <div className="mixer-controls-double" onClick={() => fromDrop(nextTrack.uri)}>
              <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
              <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
            </div>
            <svg className="mixer-controls-replay"><use xlinkHref="sprite.svg?#icon-replay"></use></svg>
          </div>
          <div className={`mixer-soundeffects` + (controls == false ? ` none hide` : ` show`)}>
            <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
            <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
            <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
            <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
          </div>
        </div>
      </div>
      {roomNameModal && <div className="roomNameModal">
          <div className="roomNameModal-box">
            <div className="roomNameModal-box-header">
              <span>Room</span>
              <div onClick={() => setRoomNameModal(false)}><svg><use xlinkHref="sprite.svg#icon-close"></use></svg></div>
            </div>
            {message && <div className="roomNameModal-box-message">{message}. Please enter a new room name.</div>}
            <div className="roomNameModal-box-input"><input type="text" placeholder="Room name" name="room" value={room} onChange={(e) => setRoom(e.target.value)}/></div>
            <button className="roomNameModal-box-button" onClick={() => (setRoomNameModal(false))}>Start Room Session</button>
            {error ? <div className="roomNameModal-box-error">{error}</div> : <div className="roomNameModal-box-error">{error}</div>}
          </div>
      </div>
      }
      {join_room_modal && 
        <div className="mixer-join_room-modal">
          <div className="mixer-join_room-content">
            <input id="pin" autoFocus placeholder="****" maxLength="4" className="mixer-join_room-input" type="text" value={join_room} onChange={ (e) => (setMessage(''), handleText(e))}/>
            <div className="mixer-join_room-title">Enter room pin to continue</div>
            <div className="mixer-join_room-button" onClick={enterRoom}>Enter room</div>
            {message && <span className="mixer-join_room-message">{message}</span>}
          </div>
        </div>
      }
    </div>
  )
}

export default spotifyService(withUser(Mixer))
