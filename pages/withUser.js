import axios from 'axios'
import {API} from '../config'
import {getUser} from '../helpers/spotifyService'
import Cookies from 'cookies'
axios.defaults.withCredentials = true

const userService = Page => {
  const withUser = props => <Page {...props} />
  
  withUser.getInitialProps = async (context) => {
    let invalidToken = false
    let newToken = null
    let newUser = null
    newUser = getUser('user', context.req) ? JSON.parse(decodeURIComponent(getUser('user', context.req).split('=')[1])) : null

    const cookies = new Cookies(context.req, context.res)
   
    if(context.query){context.query.token ? ( console.log(context.query.token), newToken = context.query.token, console.log('CONTEXT')) : (invalidToken = true)}

    if(newToken){
      cookies.set('spotifyToken', newToken)
    }
    
    return {
      ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
      newUser
    }
  }

  return withUser
}

export default userService
