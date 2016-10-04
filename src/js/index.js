const start = (e = {}) => {
  const imgIX = 'http://maxrolon.imgix.net/'
  const images = [].slice.call( document.querySelectorAll('[data-src]') )
  images.forEach( el => {
    const src = el.getAttribute('data-src')
    if (!src) return;
    const width = el.getBoundingClientRect().width
    const extUrl = `${imgIX}${src}?w=${width}&q=60`;
    const loader = new Image()
    loader.onload = () => {
      el.src = extUrl
    }
    loader.src = extUrl
  })
}
document.addEventListener('DOMContentLoaded', start)
if (document.readyState == "complete" 
  || document.readyState == "loaded" 
  || document.readyState == "interactive") {
  start()
}
