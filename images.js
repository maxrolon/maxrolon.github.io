"use strict"
const fs = require('fs')
const req = require('request')

const data = JSON.parse( fs.readFileSync('./src/data/raw.json', 'utf8') )

function request(url){
  req({
    url:`http://maxrolon.imgix.net/${url}?w=250&q=60`,
    encoding:'binary'
  }, (err, res, body) => {
    it.next(body)
  })
}

function *main(){
  for (let i in data.rows){
    for (let _i in data.rows[i]){
      let obj = data.rows[i][_i];
      if (typeof obj.src !== 'undefined' && typeof obj.dataURL == 'undefined'){
        obj.dataURL = new Buffer( yield request(obj.src), 'binary').toString('base64')
      }
    }
  }
  fs.writeFile('./src/data/data.json', JSON.stringify(data, null, 2), function(err) {
    if (err) throw err;
    process.exit()
  });
}

const it = main();
it.next();

//Keep process open
process.stdin.resume()
