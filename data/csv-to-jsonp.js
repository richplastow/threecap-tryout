const
    fs = require('fs')
  , csv = (''+fs.readFileSync('simplemaps-worldcities-basic.csv')).split('\n').slice(1)
  , jsonp = [
        'window.registerData(['
      , "    [ 'City', 'x', 'y', 'z' ]"
    ]

    //// In `pop` order eg `{ GBR:[ ['London', ...],['Birmingham', ...] ], ...}`
  , citiesBySize = {}

//// Build `citiesBySize`, sorting each city by population, keeping the biggest.
for (let i=0; i<csv.length; i++) {
    const line = csv[i].split(',')
    if (1 === line.length) continue // eg newline at end of csv file
    let [ city, city_ascii, lat, lon, pop, country, iso2, iso3 ] = line
    iso3 = 'United States of America' === iso3 ? 'USA' : iso3 // simplemaps error

// const city_iso3 = `${city}_${iso3}`
// if (
//     'London_GBR' !== city_iso3
//  && 'Paris_FRA' !== city_iso3
//  && 'New York_USA' !== city_iso3
// ) continue
// if ('USA' !== iso3) continue

    citiesBySize[iso3] = citiesBySize[iso3] || []
    const { x, y, z } = latLonToXYZ(lat, lon, 100)
    citiesBySize[iso3].push([
        city, x, y, z, pop
    ])
}
for (let iso3 in citiesBySize) {
    citiesBySize[iso3].sort( (a, b) => b[4] - a[4] ) // `[4]` is population
    const biggestNum = Math.max(100, citiesBySize[iso3].length * 0.2)
    citiesBySize[iso3] = citiesBySize[iso3].slice(0, biggestNum)
}

//// Build the output `jsonp`.
for (let iso3 in citiesBySize) {
    jsonp.push(`// ${iso3}`)
    for (let i=0; i<citiesBySize[iso3].length; i++) {
        const [ city, x, y, z, pop ] = citiesBySize[iso3][i]
        const city_iso3 = `${city}_${iso3}`
        // if (
        //     'Detroit_USA' !== city_iso3
        //  && 'Los Angeles_USA' !== city_iso3
        //  && 'New York_USA' !== city_iso3
        // ) continue
        // if (10000 > pop) continue // ignore smaller cities
        jsonp.push(
            `  , [ ${pop}, '${city.replace(/'/g,'’')}', ${x}, ${y}, ${z} ]`
        )
    }
}

jsonp.push('])')
fs.writeFileSync( 'worldcities.js', jsonp.join('\n') )




//// UTILITY

function latLonToXYZ (lat, lon, rad) {
    // lat = Math.PI / 2 - lat // Flip the Y axis
    const cosLat = Math.cos(lat * Math.PI / 180)
    const sinLat = Math.sin(lat * Math.PI / 180)
    const cosLon = Math.cos(lon * Math.PI / 180)
    const sinLon = Math.sin(lon * Math.PI / 180)
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
    //     x: rad * Math.sin(lat) * Math.sin(lon)
    //   , y: rad * Math.cos(lat)
    //   , z: rad * Math.sin(lat) * Math.cos(lon)
    // }
    // return {
    //     x: rad * Math.cos(lat) * Math.cos(lon)
    //   , y: rad * Math.cos(lat) * Math.sin(lon)
    //   , z: rad * Math.sin(lat)
    // }
}
