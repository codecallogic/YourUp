import './app.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  
  return <>
    <Head>
      <>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></meta>
      <link rel="stylesheet" href="https://use.typekit.net/xne7ixk.css"></link>
      <link rel="stylesheet" href="https://use.typekit.net/xne7ixk.css"></link>
      <link rel="stylesheet" href="https://use.typekit.net/xne7ixk.css"></link>
      <link rel="stylesheet" href="https://use.typekit.net/xne7ixk.css"></link>
      <link rel="stylesheet" href="https://use.typekit.net/xne7ixk.css"></link>
      <script type="text/javascript" src="DragDropTouch.js"></script>
      </>
    </Head>
    <Component {...pageProps}/>
  </>
}

export default MyApp
