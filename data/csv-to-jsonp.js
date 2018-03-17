const
    fs = require('fs')
  , csv = (''+fs.readFileSync('simplemaps-worldcities-basic.csv')).split('\n').slice(1)
  , jsonp = [
        'window.registerData(['
      , "    [ 'City', 'x', 'y', 'z' ]"
    ]

for (let i=0; i<csv.length; i++) {
    const line = csv[i].split(',')
    if (1 === line.length) continue
    const [ city, city_ascii, lat, lng, pop ] = line
    if (10000 > pop) continue // ignore smaller cities
    const { x, y, z } = lonLatToXYZ(lat, lng, 100)
    jsonp.push(
        `  , [ '${city.replace(/'/g,'’')}', ${x}, ${y}, ${z}, ${pop} ]`
    )
}

jsonp.push('])')
fs.writeFileSync( 'worldcities.js', jsonp.join('\n') )




//// UTILITY

function lonLatToXYZ (lon, lat, rad) {

var cosLat = Math.cos(lat * Math.PI / 180.0)
var sinLat = Math.sin(lat * Math.PI / 180.0)
var cosLon = Math.cos(lon * Math.PI / 180.0)
var sinLon = Math.sin(lon * Math.PI / 180.0)
    return {
        x: rad * cosLat * cosLon
      , y: rad * cosLat * sinLon
      , z: rad * sinLat
    }

    // //// Flip the Y axis.
    // lat = Math.PI / 2 - lat
    //
    // //// Distribute to sphere.
    // return {
    //     x: scale * Math.sin(lat) * Math.sin(lng)
    //   , y: scale * Math.cos(lat)
    //   , z: scale * Math.sin(lat) * Math.cos(lng)
    // }
}
