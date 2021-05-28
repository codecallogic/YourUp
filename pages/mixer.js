import {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import {API} from '../config'
import spotifyService from './spotifyService'
import firebase from 'firebase'
import axios from 'axios'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyD3kgibfD8dkQnX-m5ic3VDThbIYh6tIrY',
    authDomain: 'yourup-6f5b6.firebaseapp.com'
  })
}else {
  firebase.app(); // if already initialized, use that one
}

const Mixer = ({newToken, invalidToken, spotifyData, newUser}) => {
  
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [dataExists, setDataExists] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(spotifyData.currentPlaybackState ? spotifyData.currentPlaybackState.item : null)
  const [nextTrack, setNextTrack] = useState(spotifyData.track ? spotifyData.track.tracks[0] : null)
  const [counter, setCounter] = useState(0)
  const [controls, setControls]  = useState(true)
  const [ripples, setRipples]  = useState(null)
  const [shake, setShake] = useState(null)
   
  useEffect( () => {   
    Object.keys(spotifyData).length > 0 ? setDataExists(true) : null
    // Object.keys(spotifyData).length > 0 ? setCurrentDevice(spotifyData.currentPlaybackState.device.id) : null
  }, [])

  useEffect(() => {
    newUser ? null : signOut() 
  }, [newUser])

  const signOut = async () => {
    try {
      const responseSignout = await axios.post(`${API}/spotify/remove-cookie`)
      firebase.auth().signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  const playSong = async (spotifyURI, newCounter) => {
    setNextTrack(spotifyData.track.tracks[newCounter])
    
    try {
      // const responseLowerVolume = await axios.put(`${API}/spotify/volume/decrease`, {newToken})
      const responsePlay = await axios.post(`${API}/spotify/play`, {spotifyURI, newToken})
      // const responseIncreaseVolume = await axios.put(`${API}/spotify/volume/increase`, {newToken})
      setCurrentTrack(responsePlay.data.item)
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

  const onDrop = (e) => {
    let uri = e.dataTransfer.getData("uri");

    let newCounter = counter + 1

    newCounter < spotifyData.track.tracks.length ? setCounter(newCounter) : (setCounter(0), newCounter = 0);
    setRipples(null)
    setShake(true)
    playSong(uri, newCounter)
  }

  return (
    <div className="mixer-container">
      <div className="mixer">
        <div className="mixer-dj">
          <div className="mixer-dj-inTheMix">
            <img src="https://images.unsplash.com/photo-1553830591-d8632a99e6ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2111&q=80" alt="In The Mix"/>
            <div>
              <span>In the Mix</span>
              <span>Now playing</span>
            </div>
          </div>
          <div className="mixer-dj-upNext">
            <span>Up next</span>
            <div className="mixer-dj-upNext-photos">
              <img src="https://images.unsplash.com/photo-1610737245930-e4f41bab0b6b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80" alt=""/>
              <img src="https://images.unsplash.com/photo-1613672710117-0910509f9e43?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80" alt=""/>
              <img src="https://images.unsplash.com/photo-1528049711433-f04378a08933?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80" alt=""/>
              <img src="https://images.unsplash.com/photo-1582793770580-4cde3de01a62?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2972&q=80" alt=""/>
            </div>
          </div>
        </div>
        <div className="mixer-track">
          <div className={`mixer-track-current shake` + (ripples ? 'pulse' : null) + (shake ? ' shake' : null)} onDrop={(e) => onDrop(e)} onDragOver={(e)=> onDragOver(e)} onDragEnter={(e) => onDragEnterCurrent(e)}>
            {spotifyData.currentPlaybackState ? spotifyData.currentPlaybackState.item && spotifyData.currentPlaybackState.is_playing ? <>
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
            <span className="mixer-track-current-off">Ooops, a device is not currently active.</span>
            :
            null
            }
          </div>
          <div className={`mixer-track-next ` + (ripples ? 'transparent' : null)} draggable onDragStart={(e) => onDragStart(e, nextTrack.uri)} onDragEnd={(e) => onDragEnd(e)}>
            <img src={invalidToken == false ? nextTrack.album.images[0].url : null} alt=""/>
            <span>{invalidToken == false ? nextTrack.artists[0].name : null}</span>
            <span>{invalidToken == false ? nextTrack.name : null}</span>
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
            <svg className="mixer-controls-single"><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
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
    </div>
  )
}

export default spotifyService(Mixer)
