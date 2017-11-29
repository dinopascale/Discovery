class Filter {
  constructor(bridge) {
    this.bridge = bridge
    this.events = []
    this.filtered = {filterApplied: [],data: []}
    this.center = {}
    this.DOMElement = document.querySelector('#filter')

    this.paint = this.paint.bind(this)
    this.notify = this.notify.bind(this)
    this.filterByDistance = this.filterByDistance.bind(this)
    this.filterByFormat = this.filterByFormat.bind(this)
    this._getDistance = this._getDistance.bind(this)
    this.updateResult = this.updateResult.bind(this)

    this.DOMElement.appendChild(this.paint())
    this.bridge.registerObserver(this,'ADD_MARKER','SET_CENTER','HIDE_FILTER','SHOW_FILTER')
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

  filterByDistance(ev) {
    const self = this;
    let byDistance = [];
    if(ev.target.name !== 'selector-dist') {
      return false
    }
    const query = parseInt(ev.target.value);
    if(this.filtered.filterApplied.includes('distance')) {
      this.filtered['data'] = this.events.filter(el => { return self._getDistance(self.center,el.geo) <= query})
      this.filtered['filteredApplied'].push('distance')
    }

    if(this.filtered.length === 0) {
      byDistance = this.events.filter(el => { return self._getDistance(self.center,el.geo) <= query})
    } else {
      byDistance = this.filtered.filter(el => {return self._getDistance(self.center,el.geo) <= query})
    }
    this.updateResult(byDistance.length)
    this.byDistance = byDistance.reduce((map,obj) => {
      map[obj.id] = obj
      return map
    }, {})
    console.log(this.byDistance)
  }

  filterByFormat(ev) {
    console.log('chiamati', ev)
    const self = this;
    let byFormat = []
    if(ev.target.name !== 'selector-format') {
      return false
    }
    const data = (this.filtered.length===0) ? this.events : this.filtered
    const query = ev.target.value;
    if (query === 'SEALED') {
      byFormat = this.events.filter(el => el['info']['format'] === query)
    } else {
      byFormat = this.filter.filter(el => el['info']['format'] !== query);
    }
    this.updateResult(byFormat.length)
    console.log(byFormat)
  }


  paint() {
    const frag = document.createDocumentFragment()

    const title = document.createElement('h2')
    title.className = 'filter-title'
    title.textContent = 'Filter menu'
    frag.appendChild(title)

    const container = document.createElement('div')
    container.className = 'groups-container'

    const distance = document.createElement('div')
    distance.className = 'radio-group distance'
    distance.innerHTML = `<h3 class='label-group'>Distanza</h3>
                          <input type='radio' id='50km'  name='selector-dist' value='50' /><label for='50km'>50<br/>km</label>
                          <input type='radio' id='100km' name='selector-dist' value='100'/><label for='100km'>100<br/>km</label>
                          <input type='radio' id='200km' name='selector-dist' value='200'/><label for='200km'>200<br/>km</label>
                         `
    //distance.addEventListener('click',this.filterByDistance)
    container.appendChild(distance)

    const date = document.createElement('div')
    date.className = 'radio-group date'
    date.innerHTML = `<h3 class='label-group'>Data</h3>
                      <input type='radio' id='qSett' name='selector-date' value='qSett' /><label for='qSett'>Questa<br/>sett</label>
                      <input type='radio' id='pSett' name='selector-date' value='pSett' /><label for='pSett'>Prossima<br/>sett</label>
                      <input type='radio' id='dSett' name='selector-date' value='dSett' /><label for='dSett'>Fra Due<br/>sett</label>
                      <input type='radio' id='rSett' name='selector-date' value='rSett' /><label for='rSett'>Oltre Due<br/>sett</label>
                      `
    container.appendChild(date)

    const format = document.createElement('div')
    format.className='radio-group format'
    format.innerHTML = `<h3 class='label-group'>Formato</h3>
              <input type='radio' id='constructed' name='selector-format' value='CONSTRUCTED' /><label for='constructed'>Costruito</label>
              <input type='radio' id='limited' name='selector-format' value='SEALED' /><label for='limited'>Limited</label>
              `
    //format.addEventListener('click',this.filterByFormat)
    container.appendChild(format)

    container.addEventListener('click',() => {
      let arr = document.querySelectorAll('input[type="radio"]:checked');
      const arrbyfilter = arr.map(el => el.value)
      consolel
    },true)
    frag.appendChild(container)


    const result = document.createElement('div')
    result.className = 'result-btn'
    frag.appendChild(result)

    return frag;
  }

  updateResult(len) {
    this.DOMElement.querySelector('.result-btn').innerHTML = `<button id='result-btn'>${len} risultati &rarr;</button>`
  }

  notify(type,payload) {
    switch(type) {
      case 'ADD_MARKER':
        this.events = this.events.concat(payload)
        this.updateResult(payload.length)
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
      default:
        console.log('nessuna azione conosciuta')
    }
  }
}

export default Filter
