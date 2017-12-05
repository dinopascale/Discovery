class Filter {
  constructor(bridge) {
    this.bridge = bridge
    this.events = []
    this.filteredEvents = []
    this.filterByDistance = this.filterByDistance.bind(this)
    this.filterByFormat = this.filterByFormat.bind(this)
    this.filterByDate = this.filterByDate.bind(this)
    this.sendFilter = this.sendFilter.bind(this)

    this.filter = {
      dist: {
        value: null,
        label: null,
        data: [],
        f: this.filterByDistance,
        applied: false
      },
      date: {
        value: null,
        label: null,
        data: [],
        f: this.filterByDate,
        applied: false
      },
      format: {
        value: null,
        label: null,
        data: [],
        f: this.filterByFormat,
        applied: false
      }
    }
    this.center = {}
    this.calendar = {
      qSett: [],
      pSett: [],
      dSett: [],
      other: []
    }
    this.DOMElement = document.querySelector('#filter')
    this.DOMInfo = this.DOMElement.querySelector('#filter-container')
    this.activePosition = 1
    this.timeout = null;
    this.elementWidth = document.getElementById('leftbar').offsetWidth


    this.paint = this.paint.bind(this)
    this.notify = this.notify.bind(this)
    this.setFilter = this.setFilter.bind(this)
    this._getDistance = this._getDistance.bind(this)
    this.updateShowFilter = this.updateShowFilter.bind(this)
    this.resetFilter = this.resetFilter.bind(this)
    this.unsetSingleFilter = this.unsetSingleFilter.bind(this)
    this.updateResult = this.updateResult.bind(this)
    this.setCalendar = this.setCalendar.bind(this)
    this.setCarouselPosition = this.setCarouselPosition.bind(this)
    this.handleResize = this.handleResize.bind(this)

    this.DOMInfo.appendChild(this.paint())
    this.setCalendar()
    this.DOMElement.querySelector('#send-button').addEventListener('click',this.sendFilter)
    this.bridge.registerObserver(this,'ADD_MARKER','SET_CENTER','HIDE_FILTER','SHOW_FILTER','RESET_FILTER')
    window.addEventListener('resize',this.handleResize,false)
  }

  _toRadians(obj) {
    const scale = (Math.PI /180),
          geoToRadians = {"lat":obj.lat*scale,"lng":obj.lng*scale};
    return geoToRadians
  }

  _getDistance(c,p) {
    const cR = this._toRadians(c);
    const pR = this._toRadians(p);
    return parseInt(Math.acos( Math.sin(pR.lat) * Math.sin(cR.lat) + Math.cos(pR.lat) * Math.cos(cR.lat)* Math.cos(pR.lng - cR.lng)  ) * 6380)
  }

  filterByDate(query,events) {
    if(!query) {
      return false
    }
    if(query === 'other') {
      this.filter.date.data = events.filter(el => el['info']['date']>this.calendar[query])
      this.filter.date.applied = true;
    } else {
      const queryStartDate = this.calendar[query][0],
            queryEndDate   = this.calendar[query][1];
      this.filter.date.data = events.filter(el => (queryStartDate <= el['info']['date'] && el['info']['date'] <= queryEndDate))
      this.filter.date.applied = true;
    }
    console.log(this.filter.date);
  }

  filterByDistance(query,events) {
    const self = this
    if(!query) {
      return false
    }
    if(query === 'other') {
      this.filter.dist.data = events.filter(el => { return self._getDistance(self.center,el.geo) > 200})
      this.filter.dist.applied = true;
    } else {
      this.filter.dist.data = events.filter(el => { return self._getDistance(self.center,el.geo) <= query})
      this.filter.dist.applied = true;
    }
  }

  filterByFormat(query,events) {
    if(!query) {
      return false
    }
    if (query === 'SEALED') {
      this.filter.format.data = events.filter(el => el['info']['format'] === 'SEALED')
    } else {
      this.filter.format.data = events.filter(el => el['info']['format'] !== 'SEALED');
    }
    this.filter.format.applied = true;
  }

  _getMonday(date) {
    const today = new Date(date),
          day   = today.getDay() || 7;
    if(day !== 1) {
      return parseInt((new Date(today.setUTCHours(-24 * (day-1))).setUTCHours(0,0,1)) / 1000)
    } else {
      return parseInt((new Date(today).setUTCHours(0,0,1)) / 1000)
    }
  }

  _getSunday(date) {
    const today = new Date(date),
          day   = today.getDay() || 7;
    return parseInt( (new Date(today.setUTCHours(24 * (7-day))).setUTCHours(22,59,59)) / 1000 )
  }

  handleResize() {
    this.DOMElement.style.height = `${window.innerHeight- 65}px`
    if(!this.timeout) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.elementWidth = document.getElementById('leftbar').offsetWidth;
        this._resizeCarousel(this.elementWidth)
      }, 66)
    }
  }

  _resizeCarousel(elementWidth) {
    console.log(elementWidth);
    document.getElementById('filter-carousel').style.width = `${3 * elementWidth}px`
  }

  setCalendar() {
    let count  = 0
    for (let key in this.calendar) {
      const today = new Date()
      const pin = new Date(today.setUTCHours(24 * ( 7 * count )))
      this.calendar[key][0] = this._getMonday(pin)
      this.calendar[key][1] = this._getSunday(pin)
      count++
    }
    console.log(this.calendar, ' calendar');
  }

  setFilter(arr) {
    this.filteredEvents.length = 0
    console.log(this.filter);
    //We need to know how many filters are applied to our data
    let tmp = [],
        filtersApplied = 0
    Array.from(arr)
         .map(el => {
           this.filter[el.name].value = el.value
           this.filter[el.name].label = el.dataset.label
         })
    for(let key in this.filter) {
      this.filter[key].f(this.filter[key].value,this.events)
      if(this.filter[key].applied) {
        tmp = tmp.concat(this.filter[key].data)
        filtersApplied++
      }
    }
    console.log('filtri applicati ',filtersApplied);
    if(filtersApplied === 0) {
      this.filteredEvents = this.filteredEvents.concat(this.events)
      this.updateResult(this.filteredEvents.length)
    } else if(filtersApplied < 2) {
      //if filters applied are less then two, function return with the only result array avaible
      this.filteredEvents = this.filteredEvents.concat(tmp)
      this.updateResult(this.filteredEvents.length)
    } else {
      /*
      Here we count for the duplicate element in the temporary array
      and then we filter to obtain the Objects ID corresponding to the filter action
      */
      const dict = tmp.reduce((a,b) => Object.assign(a, {[b.id]:(a[b.id] || 0) + 1}), {}),
            indexOfKeys = Object.keys(dict).filter(a => dict[a] > (filtersApplied-1))
      for(var i = 0, len = indexOfKeys.length; i<len; i++) {
        this.filteredEvents.push(this.events.find(el => el.id === indexOfKeys[i]))
      }
      this.updateResult(this.filteredEvents.length)
    }
    this.updateShowFilter()
  }

  updateResult(len) {
    const arr = Object.values(this.filter),
          isNotFiltered = arr.every(el => el.applied === false);
    (!isNotFiltered)
      ? this.DOMElement.querySelector('#result-filter').innerHTML =`<h2>${len} Risultati</h2>`
      : this.DOMElement.querySelector('#result-filter').innerHTML =`<h2>FILTRI</h2>`
  }

  updateShowFilter() {
    const frag = document.createDocumentFragment(),
          obj  = this.filter,
          showFilter = this.DOMElement.querySelector('.show-filter-chosen')
    for(let key in obj) {
      const tag = document.createElement('div')
      tag.className = 'filter-tag';
      tag.className = (obj[key].applied) ?  'filter-tag' : 'filter-tag unset'
      tag.innerHTML = `<p data-key='${key}'>${obj[key].label}</p><p data-key='${key}'>&times;</p>`
      frag.appendChild(tag)
    }
    while(showFilter.firstChild) {
      showFilter.removeChild(showFilter.firstChild)
    }
    showFilter.appendChild(frag)
  }

  sendFilter() {
    const arr = Object.values(this.filter),
          isNotFiltered = arr.every(el => el.applied === false)
    if(!isNotFiltered) {
      this.bridge.sendAction('SET_FILTER',this.filteredEvents)
    } else {
      this.bridge.sendAction('UNSET_FILTER')
    }
    this.bridge.sendAction('HIDE_FILTER')
  }

  resetFilter() {
    this.filteredEvents.length = 0
    for(let key in this.filter) {
      this.filter[key].value = null;
      this.filter[key].label = null;
      this.filter[key].data.length = 0;
      this.filter[key].applied = false
    }
    this.center = null
    while(this.DOMInfo.firstChild) {
      this.DOMInfo.removeChild(this.DOMInfo.firstChild)
    }
    this.DOMInfo.appendChild(this.paint())
    this.activePosition = 1;
  }

  _animationCarousel(diff,step) {
    console.log(step);
    document.getElementById('filter-carousel').style.transform=`translateX(${diff*step}px)`
  }

  setCarouselPosition(position) {
    const step = this.elementWidth;
    this.activePosition = position
    const delta = parseInt(1 - position)
    this._animationCarousel(delta,step)
  }

  unsetSingleFilter(key) {
    const carousel = this.DOMInfo.querySelector('#filter-carousel'),
          filterToUnset = carousel.querySelectorAll(`.radio-group.${key} input[type="radio"]:checked`);
    console.log(filterToUnset[0].checked)
    filterToUnset[0].checked = false
    this.filter[key].value = null;
    this.filter[key].label = null;
    this.filter[key].data.length = 0
    this.filter[key].data = this.filter[key].data.concat(this.events)
    this.filter[key].applied = false
    this.updateShowFilter()
    this.setFilter(carousel.querySelectorAll('input[type="radio"]:checked'))
  }

  paint() {
    const frag = document.createDocumentFragment(),
          filterObj = this.filter,
          self = this;

    this.DOMElement.querySelector('#result-filter').innerHTML =`<h2>FILTRI</h2>`

    const showFilterChosen = document.createElement('div')
    showFilterChosen.className = 'show-filter-chosen'
    showFilterChosen.addEventListener('click',function(e) {
      if(e.target.tagName !== 'P') {
        return false
      }
      self.unsetSingleFilter(e.target.dataset.key)
    })
    frag.appendChild(showFilterChosen)

    const carouselWrapper = document.createElement('div')
    carouselWrapper.className = 'filter-carousel-wrapper'

    const carousel = document.createElement('div')
    carousel.className = 'filter-carousel'
    carousel.id = 'filter-carousel'
    carousel.setAttribute('style',`width: ${3 * this.elementWidth}px`)

    const distance = document.createElement('div')
    distance.className = 'radio-group dist'
    distance.innerHTML = `
                          <input type='radio' id='50km'  name='dist' value='50'  data-label = '< 50 km'/><label for='50km'>< 50<br/>km</label>
                          <input type='radio' id='100km' name='dist' value='100' data-label = '< 100 km'/><label for='100km'>< 100<br/>km</label>
                          <input type='radio' id='200km' name='dist' value='200' data-label = '< 200 km'/><label for='200km'>< 200<br/>km</label>
                          <input type='radio' id='other-dist'   name='dist' value='other' data-label = '+ 200 km'/><label for='other-dist'>+ 200<br/>km</label>
                         `
    carousel.appendChild(distance)

    const date = document.createElement('div')
    date.className = 'radio-group date'
    date.innerHTML = `
                      <input type='radio' id='qSett' name='date' value='qSett' data-label = 'questa sett' /><label for='qSett'>Questa<br/>sett</label>
                      <input type='radio' id='pSett' name='date' value='pSett' data-label = 'prossima sett' /><label for='pSett'>Prossima<br/>sett</label>
                      <input type='radio' id='dSett' name='date' value='dSett' data-label = 'fra due sett'/><label for='dSett'>Fra Due<br/>sett</label>
                      <input type='radio' id='other-date' name='date' value='other' data-label = 'oltre due sett'/><label for='other-date'>Oltre due<br/>sett</label>
                      `
    carousel.appendChild(date)

    const format = document.createElement('div')
    format.className='radio-group format'
    format.innerHTML = `
              <input type='radio' id='constructed' name='format' value='CONSTRUCTED' data-label = 'costruito'/><label for='constructed'>Costruito</label>
              <input type='radio' id='limited' name='format' value='SEALED' data-label = 'limited'/><label for='limited'>Limited</label>
              `
    carousel.appendChild(format)
    carousel.addEventListener('click',function(e){
      if(e.target.tagName !== 'INPUT') {
        return false
      }
      self.setFilter(this.querySelectorAll('input[type="radio"]:checked'))
    })
    carouselWrapper.appendChild(carousel)
    frag.appendChild(carouselWrapper)

    const carouselControl = document.createElement('div')
    carouselControl.className = 'carousel-control'

    const distControl = document.createElement('div')
    distControl.className = 'carousel-control-button active'
    distControl.innerHTML = `<p data-carousel-position='1'>Distanza</p>`
    carouselControl.appendChild(distControl)

    const dateControl = document.createElement('div')
    dateControl.className = 'carousel-control-button'
    dateControl.innerHTML = `<p data-carousel-position='2'>Data</p>`
    carouselControl.appendChild(dateControl)

    const formatControl = document.createElement('div')
    formatControl.className = 'carousel-control-button'
    formatControl.innerHTML = `<p data-carousel-position='3'>Formato</p>`
    carouselControl.appendChild(formatControl)

    carouselControl.addEventListener('click', function(e) {
      if(e.target.tagName !== 'P') {
        return false;
      }
      if(e.target.parentNode.classList.contains('active')) {
        return false
      }
      this.querySelector(`[data-carousel-position='${self.activePosition}']`).parentNode.classList.remove('active')
      self.setCarouselPosition(e.target.dataset.carouselPosition)
      e.target.parentNode.classList.add('active')
    })

    frag.appendChild(carouselControl)
    return frag;
  }

  notify(type,payload) {
    switch(type) {
      case 'ADD_MARKER':
        this.events = this.events.concat(payload)
        for(let key in this.filter) {
          this.filter[key].data = this.filter[key].data.concat(payload)
        }
        break;
      case 'SET_CENTER':
        this.center = payload
        break;
      case 'SHOW_FILTER':
        this.DOMElement.style.display = 'flex'
        break;
      case 'HIDE_FILTER':
        this.DOMElement.style.display = 'none'
        break;
      case 'RESET_FILTER':
        this.resetFilter()
        break;
      default:
        console.log('nessuna azione conosciuta')
    }
  }
}

export default Filter
