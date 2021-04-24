import axios from 'axios'
import {API} from '../config'
import {getSpotifyCookie} from '../helpers/spotifyService'
import Cookies from 'cookies'
axios.defaults.withCredentials = true

const spotifyService = Page => {
  const withSpotifyService = props => <Page {...props} />
  
  withSpotifyService.getInitialProps = async (context) => {
    const cookies = new Cookies(context.req, context.res)
    const token = getSpotifyCookie(context.req)
    let newToken = context.query ? context.query.token : null
    cookies.set('spotifyToken', newToken)

    let invalidToken = false
    let spotifyData = new Object()
    let tracks = ['40riOy7x9W7GXjyGp4pjAv']
    if(token){newToken = token.split('=')[1]}

    const headerOptions = {
      Accept: 'application/json',
      ContentType: 'application/json',
      Authorization: `Bearer ${newToken}`,
    }

    if(newToken){
      try {
        const responseCurrentPlaybackState = await axios.get(`https://api.spotify.com/v1/me/player`, {headers: headerOptions})
        const responseAvailableDevices = await axios.get(`https://api.spotify.com/v1/me/player/devices`, {headers: headerOptions})
        const responseTrack = await axios.get(`https://api.spotify.com/v1/tracks?ids=${tracks}`, {headers: headerOptions})
        
        spotifyData.currentPlaybackState = responseCurrentPlaybackState.data
        spotifyData.availableDevices = responseAvailableDevices.data
        spotifyData.track = responseTrack.data

      } catch (error) {
        console.log(error)
        if(error){ 
          if(error.response.data){
            console.log(error.response.data)
            if(error.response.data.error){
              let message = error.response.data.error.message
              message == 'Invalid access token' ? invalidToken = true : null
            }else{
              console.log(error)
            }
          }
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
