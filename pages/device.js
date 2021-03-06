import withUser from './withUser'
import spotifyService from './spotifyService'
import {useEffect, useState} from 'react'
import {API} from '../config'

const SelectDevice = ({newToken, invalidToken, spotifyData, newUser}) => {

  const [component, setComponent] = useState(null)

  useEffect(() => {
    console.log(spotifyData)
    window.localStorage.removeItem('room')
    window.localStorage.removeItem('group')
    window.localStorage.removeItem('mode')
    window.localStorage.removeItem('pin')
    invalidToken ? window.location.href = `/` : null
    Object.keys(spotifyData).length > 0 ? null : window.location.href = `${API}/spotify/login`
  }, [])
  
  return (
    <>
    {Object.keys(spotifyData).length > 0 ? null : <div className="loading-container"><div className="loading"></div></div>}
    {Object.keys(spotifyData).length > 0 ? 
      <div className="selectDevice">
        {component == null && 
        <div className="selectDevice-container">
        {spotifyData.availableDevices.devices.length !== 0 ? spotifyData.availableDevices.devices.map( (item, idx) => 
          <div key={idx} className="selectDevice-item" onClick={() => (localStorage.setItem('device', item.id), setComponent('instructions'))}><svg><use xlinkHref="sprite.svg?#icon-important_devices"></use></svg><span>{item.name.substring(0, 15)}, {item.type}</span></div>
        )
        :
        <span className="selectDevice-none">
          <span>No active devices have been found</span>
          <ol>
            <li>Open spotify app and play song to keep your spotify account active on webapp.</li>
            <li>Each user must have their own premium spotify account.</li>
            <li>Go back to web app and play song or join room.</li>
            <li>Desktop devices and tablets can keep both Spotify and Webapp active simulatneously.</li>
            <li>If disconnect from room, rejoin room with pin if room is still active.</li>
          </ol>
        </span>
        }
        </div>
        }
        {component == 'instructions' && 
        <div className="instructions">
          <button className="instructions-button" onClick={() => window.location.href = '/mixer'}>Step Up</button>
          <div className="instructions-container">
            <div className="instructions-container-title">Controls</div>
            <div className="instructions-container-item">
              <svg className="instructions-container-item-single"><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
              <span>Play from start</span>
            </div>
            <div className="instructions-container-item">
              <div className="instructions-container-item-double">
                <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
                <svg><use xlinkHref="sprite.svg?#icon-long-arrow-up"></use></svg>
              </div>
              <span>Play from drop</span>
            </div>
            <div className="instructions-container-item">
              <svg className="instructions-container-item-rewind"><use xlinkHref="sprite.svg?#icon-replay"></use></svg>
              <span>Rewind</span>
            </div>
            <div className="instructions-container-item">
              <svg className="instructions-container-item-next"><use xlinkHref="sprite.svg?#icon-waves-outline"></use></svg>
              <span>Green wave track up next</span>
            </div>
            <div className="instructions-container-item">
              <svg className="instructions-container-item-current"><use xlinkHref="sprite.svg?#icon-waves-outline"></use></svg>
              <span>Red wave current track playing</span>
            </div>
            <div className="instructions-container-item">
              <svg className="instructions-container-item-samples"><use xlinkHref="sprite.svg?#icon-cassette"></use></svg>
              <span>How to add samples</span>
            </div>
          </div>
        </div>
        }
      </div>
      :
      <div className="selectDevice-message">Error getting spotify data, please try again later.</div>
    }
    </>
  )
}

export default spotifyService(withUser(SelectDevice))
