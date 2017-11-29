import API from './API'


/*
The brain of my WebApp: here all the information are sent and dispatched disguised as
ACTION (active) and OBSERVE (passive) in some OBSERVER-ish pattern
*/
function Bridge() {
  let inputName = '';

  const observerList = {}

  /*
  Same as OBSERVER pattern, but here we notify only those components which
  listen for determined ACTION in an 1v1 link
  */
  function notifyObserver (type,result = []) {
    observerList[type].forEach(observer => {
      observer.notify(type,result)
    })
  }

  /*
  This function is called after gmap is initialized and
  respond with an AJAX call for events list which in turn
  will become Marker of our map
  */
  function addMarker(type) {
    _createMarkersArray()
     .then(markerArray => {
       notifyObserver(type,markerArray)
     })
     .catch(err => {
       notifyObserver('RAISE_ERROR',"C'è stato un errore con il server!"+err)
     })
  }

  /*
  helper function for retrieve events from server and formatting data
  */
  function _createMarkersArray() {
    const events = []
    return new Promise((res,rej) => {
      API.getEventsList()
       .then(json => {
         for (let key in json) {
           //here we re-arranged data for better communication with googleMaps API
           const event = {
               "geo":{
                   "lat":json[key]['lt'],
                   'lng':json[key]['ln']
               },
               'info': {
                   'city':json[key]['city'],
                   'ng':json[key]['ng'],
                   'date':json[key]['date'],
                   'adr':json[key]['adr'],
                   'logo':json[key]['logo'],
                   'format': json[key]['format']
               },
               'id':key}
           events.push(event)
         }
         res(events)
       })
       .catch(err => rej(err))
    })
  }
  /*
  This function is called when user stops to write into InputField
  and returns with the results of AJAX call for the json with italian cities
  which name begin with the same letter of user's choice
  */
  function createSuggestionList(type,payload) {
    notifyObserver('CHANGE_SCENE','suggestion')
    //if InputField is empty show only main message
    if(payload.length === 0) {
      notifyObserver('HIDE_MAP')
      notifyObserver('HIDE_SUGGESTION')
      notifyObserver('HIDE_ERROR')
      notifyObserver('CHANGE_SCENE','initial')
      return false
    }
    payload = payload.trim()
    //simple RegExp for alpha,\' and space only
    const re = /^[a-zA-Z]|[a-zA-Z]+[a-zA-Z\'\-\s\b]+$/i
    if(payload.match(new RegExp(re))) {
      notifyObserver('HIDE_ERROR')
      payload = payload[0].toUpperCase() + payload.slice(1);
      API.getCitiesList(payload)
       .then(data => {
         const filter = data.filter(city => city.n.startsWith(payload))
         notifyObserver(type,filter)
       })
    } else {
      notifyObserver('RAISE_ERROR','inserisci solo lettere')
    }
  }

  function hideSingle(classList) {
    console.log(classList);
    (classList.contains('filter'))
      ? notifyObserver('HIDE_FILTER')
      : notifyObserver('HIDE_SINGLE');
    notifyObserver('CHANGE_SCENE','map')
  }

  function requestSingle(type,marker) {
    notifyObserver(type,marker)
    notifyObserver('CHANGE_SCENE','single')
  }

  /*
  This function is called when user clicks on target city on SuggestionList
  and will hide suggestionList and set the center of google maps on LatLon of
  user choice
  */
  function setCenter(type,center) {
    console.log(center)
    const LatLon = {
      lat : center.lat,
      lng : center.lng
    }
    notifyObserver(type,LatLon)
    notifyObserver('HIDE_SUGGESTION')
    notifyObserver('CHANGE_SCENE','map')
    inputName = center.name;
    notifyObserver('SET_VALUE',inputName)
  }

  function resetValue() {
    inputName = '';
    console.log(inputName);
    notifyObserver('SET_VALUE',inputName)
    notifyObserver('CHANGE_SCENE','initial')
    notifyObserver('HIDE_SUGGESTION')
    notifyObserver('HIDE_MAP')
  }

  //actionChecker is a function with switch control for action type
  //For each case we respond with determined function
  function actionChecker(type,payload) {
    switch(type) {
      case 'CREATE_SUGGESTION_LIST':
        createSuggestionList(type,payload)
        break;
      case 'ADD_MARKER':
        addMarker(type)
        break;
      case 'SET_CENTER':
        setCenter(type,payload)
      case 'FILTER_RESULT_LIST':
        break;
      case 'REQUEST_SINGLE':
        requestSingle(type,payload)
        break;
      case 'CHANGE_SCENE':
        notifyObserver(type,payload)
        break;
      case 'RESET_VALUE':
        resetValue()
        break;
      case 'HIDE_SINGLE':
        hideSingle(payload)
        break;
      case 'SHOW_FILTER':
        notifyObserver(type,payload)
        notifyObserver('CHANGE_SCENE','filter')
        break;
      case 'HIDE_FILTER':
        notifyObserver(type,payload)
        break;
      default:
        console.log('nessuna azione ricevuta')
        break;
    }
  }

  return {
      sendAction: (type,payload) => {
          actionChecker(type,payload)
      },
      registerObserver: (item,...types) => {
        for(let i =0, len = types.length;i<len;i++) {
          if(!observerList.hasOwnProperty(types[i])) {
            observerList[types[i]] = []
          }
            observerList[types[i]].push(item)
        }
        console.log('observerList',observerList)
      }
  }
}

export default Bridge;
