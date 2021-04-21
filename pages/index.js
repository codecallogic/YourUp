import {useEffect, useState} from 'react'
import firebase from 'firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { useRouter } from 'next/router'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyD3kgibfD8dkQnX-m5ic3VDThbIYh6tIrY',
    authDomain: 'yourup-6f5b6.firebaseapp.com'
  })
}else {
  firebase.app(); // if already initialized, use that one
}

const Home = ({}) => {

  const router = useRouter()

  const [user, setUser] = useState(null)

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged( user => {
      setUser(user)
      user ? router.push('/mixer') : null
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
        <StyledFirebaseAuth 
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
      <div className="home-wave-container">
        <div className="home-wave">
          <div className="waveWrapper waveAnimation">
            <div className="waveWrapperInner bgTop">
              <div className="wave waveTop" style={{'backgroundImage': 'url("http://front-end-noobs.com/jecko/img/wave-top.png")'}}></div>
            </div>
            <div className="waveWrapperInner bgMiddle">
              <div className="wave waveMiddle" style={{'backgroundImage': 'url("http://front-end-noobs.com/jecko/img/wave-mid.png")'}}></div>
            </div>
            <div className="waveWrapperInner bgBottom">
              <div className="wave waveBottom" style={{'backgroundImage': 'url("http://front-end-noobs.com/jecko/img/wave-bot.png")'}}></div>
            </div>
          </div>
        </div>
        </div>
    </div>
  )
}

export default Home
