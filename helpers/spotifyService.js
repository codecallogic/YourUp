import cooke from 'js-cookie'

export const getSpotifyCookie = (req) => {
  if(!req.headers.cookie){
    return undefined
  }

  let token = req.headers.cookie

  if(!token){
      return undefined
  }

  const array = new Array(token.split(';'))

  const newArray = array[0].map( (i) => {
    return i.trim()
  })

  let parsedToken = newArray.find( a => a.includes("spotifyToken"))

  return parsedToken
}