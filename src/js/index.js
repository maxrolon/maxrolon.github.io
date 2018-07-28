import scroll from 'raf-scroll.js'

const imgIX = 'https://maxrolon.tiny.pictures/main/'

const loadIn = (el) => {
  const src = el.getAttribute('data-src')
  if (!src) return;
  let width = Math.ceil( el.getBoundingClientRect().width * (window.devicePixelRatio || 1) )
  //round to next 100px interval
  width = Math.ceil(width/100)*100
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
    .reduce( (obj, el, i) => (obj[i] = el, obj), {})
  let wHeight;
  let getAllOffsets;
  (getAllOffsets = function(){
    for ( let i in images){
      cacheOffsets( images[i] )
    }
    wHeight = getWHeight()
  })();
  let check;
  scroll(check = function(y){
    for ( let i in images){
      if ( images[i].offsetY < ( y + wHeight) ){
        loadIn( images[i] )
        delete images[i]
      }
    }
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
