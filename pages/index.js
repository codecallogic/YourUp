
const Home = ({}) => {
  
  return (
    <div className="home-container">
      <div className="home">
        <svg className="home-icon">
          <use xlinkHref="/sprite.svg#icon-spotify"></use>
        </svg>
        <h1>YourUp</h1>
        <h6>You need a premium account to gain access</h6>
        <button className="home-login-google">
          <img src="/media/google-signin.png" alt="Google Signin"/>
        </button>
        <button className="home-login-facebook">
          <svg>
            <use xlinkHref="/sprite.svg#icon-facebook2"></use>
          </svg>
          <span>Sign in with Facebook</span>
        </button>
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
