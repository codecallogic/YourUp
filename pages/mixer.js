import {useEffect, useState} from 'react'
import firebase from 'firebase'
import { useRouter } from 'next/router'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyD3kgibfD8dkQnX-m5ic3VDThbIYh6tIrY',
    authDomain: 'yourup-6f5b6.firebaseapp.com'
  })
}else {
  firebase.app(); // if already initialized, use that one
}

const Mixer = ({}) => {

  const router = useRouter()

  const [user, setUser] = useState(null)
  
  useEffect(() => {
    firebase.auth().onAuthStateChanged( user => {
      setUser(user)
      user ? null : router.push('/')
    })
  }, [])

  const signOut = () => {
    firebase.auth().signOut()
    setUser(null)
    router.push('/')
  }
  
  return (
    <div className="mixer-container">
      <div className="mixer">
        <h1>Hello, {user ? user.displayName : null}</h1>
        <img src={user ? user.photoURL : null} alt=""/>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </div>
  )
}

export default Mixer
