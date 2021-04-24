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
  
  useEffect(() => {
    firebase.auth().onAuthStateChanged( user => {
      setUser(user)
      user ? null : router.push('/')
      invalidToken == true ? signOut() : null
    })
    console.log(invalidToken)
    console.log(spotifyData)
    Object.keys(spotifyData).length > 0 ? setDataExists(true) : null
    Object.keys(spotifyData).length > 0 ? setCurrentDevice(spotifyData.currentPlaybackState.device.id) : null
  }, [])

  const signOut = () => {
    firebase.auth().signOut()
    setUser(null)
    router.push('/')
  }

  const playSong = async () => {
    let spotifyURI = spotifyData.track.tracks[0].uri

    try {
      const responsePlay = await axios.post(`${API}/spotify/play`, {spotifyURI, newToken})
      console.log(responsePlay)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="mixer-container">
      <div className="mixer">
        <h1>Hello, {user ? user.displayName : null}</h1>
        <div className="mixer-song">
          <h1>{dataExists ? spotifyData.track.tracks[0].name : 'No song currently listed'}</h1>
          <img src={dataExists ? spotifyData.track.tracks[0].album.images[0].url : `https://via.placeholder.com/300.png`} alt=""/>
          <button onClick={playSong}>Play Song</button>
        </div>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </div>
  )
}

export default spotifyService(Mixer)
