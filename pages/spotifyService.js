import axios from 'axios'
import {API} from '../config'
import {getCookie} from '../helpers/spotifyService'
import Cookies from 'cookies'
axios.defaults.withCredentials = true

const spotifyService = Page => {
  const withSpotifyService = props => <Page {...props} />
  
  withSpotifyService.getInitialProps = async (context) => {
    let invalidToken = false
    let newToken = null
    const cookies = new Cookies(context.req, context.res)
   
    if(context.query){context.query.token ? ( console.log(context.query.token), newToken = context.query.token, console.log('CONTEXT')) : (invalidToken = true)}

    if(newToken){
      cookies.set('spotifyToken', newToken)
    }

    const token = getCookie('spotifyToken', context.req)
    if(token){newToken = token.split('=')[1]; invalidToken = false;}

    let spotifyData = new Object()
    let tracks = ['4DqO37N1eWHWKhvcgCho9F', '2GQEM9JuHu30sGFvRYeCxz']

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
        // console.log(error.response.data.error.message)
        if(error){ 
          if(error.response.data){
            console.log(error.response.data)
            if(error.response.data.error){
              let message = error.response.data.error.message
              console.log(message)
              message == 'Invalid access token' ? invalidToken = true : null
              message == 'The access token expired' ? invalidToken = true : null
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
