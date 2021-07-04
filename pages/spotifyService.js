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

    let spotifyData = new Object()
    let tracks = ['0J7oHYxjF6Oln61wy0kP2i', '3cCxoOgfi6hgt8MNteuiiD', '21bhcTyR7wRA9xQt9fSpj3', '2P3SLxeQHPqh8qKB6gtJY2']

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
