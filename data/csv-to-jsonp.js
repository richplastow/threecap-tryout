const
    fs = require('fs')
  , csv = (''+fs.readFileSync('simplemaps-worldcities-basic.csv')).split('\n').slice(1)
  , jsonp = [
        'window.registerData(['
      , "    [ 'pop', 'city', 'x', 'y', 'z', 'lat', 'lon' ]"
    ]

    //// In `pop` order eg `{ GBR:[ ['London', ...],['Birmingham', ...] ], ...}`
  , citiesBySize = {}

//// Build `citiesBySize`, sorting each city by population, keeping the biggest.
for (let i=0; i<csv.length; i++) {
    const line = csv[i].split(',')
    if (1 === line.length) continue // eg newline at end of csv file
    let [ city, city_ascii, lat, lon, pop, country, iso2, iso3 ] = line
    // if (10000 > pop) continue // ignore smaller cities
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
        pop, city, x, y, z, lat, lon
    ])
}
for (let iso3 in citiesBySize) {
    citiesBySize[iso3].sort( (a, b) => b[0] - a[0] ) // `[0]` is population
    // const biggestNum = Math.max(100, citiesBySize[iso3].length * 0.5)
    // citiesBySize[iso3] = citiesBySize[iso3].slice(0, biggestNum)
}

//// Build the output `jsonp`.
for (let iso3 in citiesBySize) {
    jsonp.push(`// ${iso3}`)
    for (let i=0; i<citiesBySize[iso3].length; i++) {
        const [ pop, city, x, y, z, lat, lon ] = citiesBySize[iso3][i]
        const city_iso3 = `${city}_${iso3}`
        // if (
        //     'Detroit_USA' !== city_iso3
        //  && 'Los Angeles_USA' !== city_iso3
        //  && 'New York_USA' !== city_iso3
        // ) continue
        // if (10000 > pop) continue // ignore smaller cities
        jsonp.push(
            `  , [ ${pop}, '${city.replace(/'/g,'’')}', ${x},${y},${z}, ${lat},${lon} ]`
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
    const x = rad * cosLat * cosLon
    const y = rad * cosLat * sinLon
    const z = rad * sinLat
    return {
        x: x
      , y: z   // for correct THREE.js coords, swap y with z...
      , z: - y // ...and z with -y
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
