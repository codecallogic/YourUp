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

const Mixer = ({newToken, invalidToken, spotifyData}) => {

  const router = useRouter()

  const [user, setUser] = useState(null)
  const [dataExists, setDataExists] = useState(false)
  const [currentDevice, setCurrentDevice] = useState(null)
  
  useEffect( () => {
    invalidToken == true ? signOut(): null
    
    firebase.auth().onAuthStateChanged( user => {
      setUser(user)
      user ? null : (signOut(), router.push('/'))
    })

    Object.keys(spotifyData).length > 0 ? setDataExists(true) : null
    // Object.keys(spotifyData).length > 0 ? setCurrentDevice(spotifyData.currentPlaybackState.device.id) : null
  }, [])

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

  const playSong = async (spotifyURI) => {
    try {
      // const responseLowerVolume = await axios.put(`${API}/spotify/volume/decrease`, {newToken})
      const responsePlay = await axios.post(`${API}/spotify/play`, {spotifyURI, newToken})
      // const responseIncreaseVolume = await axios.put(`${API}/spotify/volume/increase`, {newToken})
      console.log(responsePlay)
    } catch (error) {
      console.log(error)
    }
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
          <div className="mixer-track-current" onClick={() => playSong(spotifyData.track.tracks[0].uri)}>
            <img src={invalidToken == false ? spotifyData.track.tracks[0].album.images[0].url : null} alt=""/>
            <span>{invalidToken == false ? spotifyData.track.tracks[0].artists[0].name : null}</span>
            <span>{invalidToken == false ? spotifyData.track.tracks[0].name : null}</span>
          </div>
          <div className="mixer-track-next" onClick={() => playSong(spotifyData.track.tracks[1].uri)} >
            <img src={invalidToken == false ? spotifyData.track.tracks[1].album.images[0].url : null} alt=""/>
            <span>{invalidToken == false ? spotifyData.track.tracks[1].artists[0].name : null}</span>
            <span>{invalidToken == false ? spotifyData.track.tracks[1].name : null}</span>
          </div>
        </div>
        <div className="mixer-controls">
          <svg className="mixer-controls-single"><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
          <div className="mixer-controls-double">
            <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
            <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
          </div>
          <svg className="mixer-controls-replay"><use xlinkHref="sprite.svg?#icon-replay"></use></svg>
        </div>
        <div className="mixer-soundeffects">
          <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
          <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
          <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
          <svg><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
        </div>
      </div>
    </div>
  )
}

export default spotifyService(Mixer)
