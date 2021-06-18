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
  const [nextTrack, setNextTrack] = useState(spotifyData.track ? spotifyData.track.tracks[0] : null)
  const [counter, setCounter] = useState(0)
  const [controls, setControls]  = useState(true)
  const [ripples, setRipples]  = useState(null)
  const [shake, setShake] = useState(null)
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState(false)
  const [roomNameModal, setRoomNameModal] = useState(false)
  const [error, setError] = useState('')
  const [group, setGroup] = useState([newUser])
  const [activeRoom, setActiveRoom] = useState(null)
   
  useEffect( () => {
    console.log(group)
    group.length == 0 ? setActiveRoom(null) : null
    invalidToken ? window.location.href = `/` : null

    Object.keys(spotifyData).length > 0 ? null : window.location.href = `${API}/spotify/login`
    Object.keys(spotifyData).length > 0 ? setDataExists(true) : null

    socket.on('join-room', (data) => {
      setGroup(data.group)
      setActiveRoom(data.room)
    })

    socket.emit('online-mixer', {displayName: newUser.displayName, photoURL: newUser.photoURL, email: newUser.email}, (users) => {
      let isInArray = []
      // console.log(users)
      if(JSON.parse(window.localStorage.getItem('group'))){
        JSON.parse(window.localStorage.getItem('group')).find((item) => {
          users.forEach( (el) => {
            if(el.email == item.email) isInArray.push(el)
          })
        })
        
        isInArray.forEach((item) => {
          item.room = JSON.parse(window.localStorage.getItem('room'))
          socket.emit('send-room', {id: item.id, room: item.room, group: isInArray})
        })
      }
      
      setActiveRoom(JSON.parse(window.localStorage.getItem('room')))
      setGroup([...isInArray])
    })

    socket.on('online-mixer', (users) => {
      let isInArray = []
      if(JSON.parse(window.localStorage.getItem('group'))){
        JSON.parse(window.localStorage.getItem('group')).find((item) => {
          users.forEach( (el) => {
            if(el.email == item.email) isInArray.push(el)
          })
        })
        
        isInArray.forEach((item) => {
          item.room = JSON.parse(window.localStorage.getItem('room'))
          socket.emit('send-room', {id: item.id, room: item.room, group: isInArray})
        })
      }
      
      setActiveRoom(JSON.parse(window.localStorage.getItem('room')))
      setGroup([...isInArray])
    })

    socket.on('play', (play) => {
      console.log(play)
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

    socket.emit('send-song', group[0])
    playSong(uri, newCounter)
  }

  return (
    <div className="mixer-container">
      <div className="mixer">
        <div className="mixer-dj">
          <div className="mixer-dj-inTheMix">
            <img src={group.length > 0 ? group[0].photoURL : newUser.photoURL} alt="In The Mix"/>
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
            <svg className="mixer-controls-single" onClick={() => socket.emit('send-song', {room: activeRoom})}><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
            <div className="mixer-controls-double">
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
            <button className="roomNameModal-box-button" onClick={() => (setRoomNameModal(false), setUpRoom(room))}>Start Room Session</button>
            {error ? <div className="roomNameModal-box-error">{error}</div> : <div className="roomNameModal-box-error">{error}</div>}
          </div>
      </div>
      }
    </div>
  )
}

export default spotifyService(withUser(Mixer))
