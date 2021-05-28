import axios from 'axios'
import {API} from '../config'
import {getUser} from '../helpers/spotifyService'
axios.defaults.withCredentials = true

const userService = Page => {
  const withUser = props => <Page {...props} />
  
  withUser.getInitialProps = async (context) => {
    let newUser = null
    newUser = getUser('user', context.req) ? JSON.parse(decodeURIComponent(getUser('user', context.req).split('=')[1])) : null

    // if(!newUser){
    //   context.res.writeHead(302, {
    //     Location: '/'
    //   });
    //   context.res.end();
    // }else{
      return {
        ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
        newUser
      }
    // }
  }

  return withUser
}

export default userService
