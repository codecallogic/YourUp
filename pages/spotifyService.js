import axios from 'axios'
import {API} from '../config'
import {getCookie, getUser} from '../helpers/spotifyService'
axios.defaults.withCredentials = true

const spotifyService = Page => {
  const withSpotifyService = props => <Page {...props} />
  
  withSpotifyService.getInitialProps = async (context) => {
    let invalidToken = false
    let newToken = null
    let newUser = null

    const token = getCookie('spotifyToken', context.req)

    if(token){newToken = token.split('=')[1]; invalidToken = false;}
    newUser = getUser('user', context.req) ? JSON.parse(decodeURIComponent(getUser('user', context.req).split('=')[1])) : null
    console.log(newUser)

    let spotifyData = new Object()
    let tracks = ['2SxeNZphx2bH5kju5Ntu8P', '5IlR8G1OEn99cV3WB49O7o', '4DqO37N1eWHWKhvcgCho9F', '7hofL9YADeFqnsFdDrxdbs', '2GQEM9JuHu30sGFvRYeCxz']

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

    if(!newUser){
      context.res.writeHead(302, {
        Location: '/'
      });
      context.res.end();
    }else{
      return {
        ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
        newToken,
        invalidToken,
        spotifyData
      }
    }
  }

  return withSpotifyService
}

export default spotifyService
