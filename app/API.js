var xhr = null;
import Cache from './cache'

class API {
  static _makeAJAX(url) {
    return new Promise((res,rej) => {
      if(xhr !== null) {
        xhr.abort()
        xhr = null
      }
      xhr = new XMLHttpRequest()
      xhr.open('GET',url)
      xhr.send()
      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            res(JSON.parse(xhr.responseText))
          } else {
            rej(xhr.status)
          }
        }
      }
    })
  }

  static getCitiesList (i) {
    const firstLetter = i[0]
    return new Promise( (res,rej) => {
      //Check if data are present in cache
      Cache.checkCity(firstLetter)
        .then(check => {
          if(check) {
            Cache.getCity(firstLetter)
             .then(data => res(data))
          } else {
            const url = `assets/data/${firstLetter}.json`
            API._makeAJAX(url)
             .then(data => {
               Cache.setCity(firstLetter,data)
               res(data)
             })
             .catch(err => rej(err))
          }
        })
    })
  }

  static getEventsList(geo) {
    return new Promise( (res,rej) => {
      const url = 'assets/data/eventi.json'
      if(Cache.storageAvaible('sessionStorage')) {
        if(Cache.checkEvents()) {
          res(Cache.getEvents())
        } else {
          API._makeAJAX(url)
           .then(data => {
             Cache.setEvents(data)
             res(data)
           })
           .catch(err => rej(err))
        }
      } else {
        API._makeAJAX(url)
         .then(data => res(data))
         .catch(err => rej(err))
      }
    })
  }
}

export default API
