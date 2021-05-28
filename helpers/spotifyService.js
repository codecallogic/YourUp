import cookie from 'js-cookie'

export const getCookie = (key, req) => {
  return process.browser ? getCookieFromBrowser(key) : getSpotifyCookie(key, req)
}

export const getUserCookie = (key, req) => {
  return process.browser ? getCookieFromBrowser(key) : getUser(key, req)
}

export const getCookieFromBrowser = (key) => {
  return cookies.get(key)
}

export const getSpotifyCookie = (key, req) => {
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

export const getUser = (key, req) => {
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

  let parsedToken = newArray.find( a => a.includes("user"))

  return parsedToken
}