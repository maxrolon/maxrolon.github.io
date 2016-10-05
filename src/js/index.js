import scroll from 'raf-scroll.js'

const imgIX = 'https://maxrolon.imgix.net/'

const loadIn = (el) => {
  const src = el.getAttribute('data-src')
  if (!src) return;
  const width = Math.ceil( el.getBoundingClientRect().width * ( (window.devicePixelRatio || 1) * 0.75 ) )
  const extUrl = `${imgIX}${src}?w=${width}&q=60`;
  const loader = new Image()
  loader.onload = () => {
    el.src = extUrl
  }
  loader.src = extUrl
}

const getOffset = (el, win=window, docElem=document.documentElement, box=false) => (
  box = el.getBoundingClientRect(),
  box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0)
)

const getWHeight = () => Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

const cacheOffsets = el => el.offsetY = getOffset(el)

const start = (e = {}) => {
  const images = [].slice.call( document.querySelectorAll('[data-src]') )
  let wHeight;
  let getAllOffsets;
  (getAllOffsets = function(){
    images.forEach(cacheOffsets)
    wHeight = getWHeight()
  })();
  let check;
  scroll(check = function(y){
    images.forEach( el => {
      if ( el.offsetY < ( y + wHeight) ){
        loadIn(el)
      }
    })
  })

  window.addEventListener('resize', getAllOffsets)
}

const delay = () => setTimeout(start, 500)

document.addEventListener('DOMContentLoaded', delay)
if (document.readyState == "complete" 
  || document.readyState == "loaded" 
  || document.readyState == "interactive") {
  delay()
}
