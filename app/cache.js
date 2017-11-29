import localforage from 'localforage'

class Cache {

  static checkCity (key) {
    return new Promise (res => {
      localforage.keys().then(keys => res(keys.includes(key)))
    })
  }

  static getCity(key) {
    return new Promise((res,rej) => {
      localforage.getItem(key).then(data => res(data))
    })
  }

  static setCity(key,data) {
    localforage.setItem(key,data)
  }

  /*
    This section need to be update in order to use IndexedDB instead of sessionStorage
    But before we do that, we must implement a way to sync client data and server data
  */
  static storageAvaible(type) {
    try {
      const storage = window[type],
            x = '__storage_test__';
      storage.setItem(x,x)
      storage.removeItem(x)
      return true
    }
    catch(e) {
      return e instanceof DOMException && (
        e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      ) &&
      storage.length !==0
    }
  }

  static checkEvents() {
    return Boolean(sessionStorage.length)
  }

  static getEvents() {
    return JSON.parse(sessionStorage.getItem('Events'))
  }

  static setEvents(events) {
    sessionStorage.setItem('Events',JSON.stringify(events))
  }

}

export default Cache
