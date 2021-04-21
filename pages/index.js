import {useEffect, useState} from 'react'
import firebase from 'firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyD3kgibfD8dkQnX-m5ic3VDThbIYh6tIrY',
    authDomain: 'yourup-6f5b6.firebaseapp.com'
  })
}else {
  firebase.app(); // if already initialized, use that one
}

const Home = ({}) => {

  const [user, setUser] = useState(false)

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccess: () => false
    }
  }

  const signOut = () => {
    firebase.auth().signOut()
    setUser(false)
    location.reload()
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged( user => {
      setUser(!!user)
    })
  }, [])
  
  return (
    <div className="home-container">
      <div className="home">
        <svg className="home-icon">
          <use xlinkHref="/sprite.svg#icon-spotify"></use>
        </svg>
        <h1>YourUp</h1>
        <h6>You need a premium account to gain access</h6>
        {user ? 
        <button onClick={signOut} className="home-login-google">Sign Out</button>
        : null}
        <StyledFirebaseAuth 
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
        <span>{user ? <span>{firebase.auth().currentUser.displayName}</span>: null}</span>
      </div>
      <div className="home-wave-container">
        <div className="home-wave">
          <div className="waveWrapper waveAnimation">
            <div className="waveWrapperInner bgTop">
              <div className="wave waveTop" style={{'background-image': 'url("http://front-end-noobs.com/jecko/img/wave-top.png")'}}></div>
            </div>
            <div className="waveWrapperInner bgMiddle">
              <div className="wave waveMiddle" style={{'background-image': 'url("http://front-end-noobs.com/jecko/img/wave-mid.png")'}}></div>
            </div>
            <div className="waveWrapperInner bgBottom">
              <div className="wave waveBottom" style={{'background-image': 'url("http://front-end-noobs.com/jecko/img/wave-bot.png")'}}></div>
            </div>
          </div>
        </div>
        </div>
    </div>
  )
}

export default Home
