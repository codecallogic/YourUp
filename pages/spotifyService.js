import axios from 'axios'
import {API} from '../config'
import {getSpotifyCookie} from '../helpers/spotifyService'
axios.defaults.withCredentials = true

const spotifyService = Page => {
  const withSpotifyService = props => <Page {...props} />
  
  withSpotifyService.getInitialProps = async context => {
    
    const token = getSpotifyCookie(context.req)
    let newToken = null
    let invalidToken = false
    let spotifyData = new Object()
    let tracks = ['40riOy7x9W7GXjyGp4pjAv']
    if(token){newToken = token.split('=')[1]}

    const headerOptions = {
      Accept: 'application/json',
      ContentType: 'application/json',
      Authorization: `Bearer ${newToken}`,
    }

    try {
      const responseCurrentPlaybackState = await axios.get(`https://api.spotify.com/v1/me/player`, {headers: headerOptions})
      const responseAvailableDevices = await axios.get(`https://api.spotify.com/v1/me/player/devices`, {headers: headerOptions})
      const responseTrack = await axios.get(`https://api.spotify.com/v1/tracks?ids=${tracks}`, {headers: headerOptions})

      spotifyData.currentPlaybackState = responseCurrentPlaybackState.data
      spotifyData.availableDevices = responseAvailableDevices.data
      spotifyData.track = responseTrack.data

    } catch (error) {
      if(error){ 
        if(error.response.data){
          let message = error.response.data.error.message
          message == 'Invalid access token' ? invalidToken = true : null
        }
      }
    }
    
    return {
      ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
      newToken,
      invalidToken,
      spotifyData
    }
  }

  return withSpotifyService
}

export default spotifyService
