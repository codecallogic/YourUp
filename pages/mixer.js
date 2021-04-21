import {useEffect, useState} from 'react'
import firebase from 'firebase'

const Mixer = ({}) => {

  const [user, setUser] = useState(null)
  
  useEffect(() => {
    firebase.auth().onAuthStateChanged( user => {
      setUser(user)
    })
  }, [])
  return (
    <div className="mixer-container">
      <div className="mixer">
        <h1>Hello, {user ? user.displayName : null}</h1>
        <img src={user ? user.photoURL : null} alt=""/>
      </div>
    </div>
  )
}

export default Mixer
