let data = []

;for (let k = 0; k < 3; k++){
  data[k] = (function(x){
    return function(){
      console.dir(x)
    }
  })(k)
}

data[0]()
data[1]()
data[2]()
