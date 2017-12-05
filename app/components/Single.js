const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

class Single {
  constructor(bridge) {
    this.bridge = bridge;
    this.notify = this.notify.bind(this)
    this.handleResize = this.handleResize.bind(this)
    //this.closeSingle = this.closeSingle.bind(this)
    this.bridge.registerObserver(this,'REQUEST_SINGLE','HIDE_SINGLE')

    this.DOMElement = document.querySelector('#detail')
    this.detail = null;
    window.addEventListener('resize',this.handleResize,false)
  }

  /*closeSingle(ev) {
    if(ev.target !== this.detail) {
      this.DOMElement.style.display = 'none'
      this.bridge.sendAction('CHANGE_SCENE','map')
    } else {
      return false
    }
  }*/

  handleResize() {
    this.DOMElement.style.height = `${window.innerHeight- 65}px`
  }

  paintSingle(infos) {
    const frag = document.createDocumentFragment();
    const content = document.createElement('div')
    content.className = 'content'
    content.id = 'content'

    const ng = document.createElement('div')
    ng.className = 'single-ng'
    ng.innerHTML = `<h2>${infos['info']['ng']}</h2>`
    content.appendChild(ng)

    const oblo = document.createElement('div')
    oblo.className = 'single-oblo'
    content.appendChild(oblo)

    const general = document.createElement('div')
    general.className = 'single-general'

    /*const logo = document.createElement('img')
    logo.src = infos['info']['logo']
    logo.className = 'logo'
    general.appendChild(logo)*/

    const infoGrid = document.createElement('div')
    infoGrid.className = 'infoGrid'

    const date = document.createElement('div'),
          start = new Date(infos['info']['date'] * 1000),
          day = (start.getUTCDate()>=1 && start.getUTCDate()<=9) ? '0'+start.getUTCDate() : start.getUTCDate(),
          month = months[start.getMonth()];
    date.className = 'single-row info-chunk date'
    date.innerHTML = `<h4>quando </h4><h3>${day} ${month}</h3>`
    infoGrid.appendChild(date)

    const address = document.createElement('div')
    address.className='single-row info-chunk adr'
    address.innerHTML=`<h4>dove </h4><h3>${infos['info']['adr']}, ${infos['info']['city']}</h3>`
    infoGrid.appendChild(address)

    const eta = document.createElement('div')
    eta.className = 'single-row info-chunk eta'
    eta.id='eta'
    eta.innerHTML=`<h4>tempo per arrivare </h4><h3>Calcolando ...</h3>`
    infoGrid.appendChild(eta)

    const format = document.createElement('div')
    format.className = 'single-row info-chunk format'
    format.innerHTML = `<h4>formato </h4><h3>${infos['info']['format']}</h3>`
    infoGrid.appendChild(format)

    general.appendChild(infoGrid)

    content.appendChild(general)

    frag.appendChild(content)
    return frag
  }

  calcEta(obj) {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [{lat:obj.clt,lng:obj.cln}],
        destinations: [{lat:obj.lt,lng:obj.ln}],
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: new Date(Date.now()),
            trafficModel: 'optimistic'
        }
    }, function(response,status) {
        if(status == 'OK') {
            for(let i =0, len = response.rows.length;i<len;i++) {
                for(let j=0, len = response.rows[i].elements.length;j<len;j++) {
                    this.detail.querySelector('#eta').innerHTML = `<h4>tempo in macchina </h4><h3>${response.rows[i].elements[j].duration_in_traffic.text}</h3>`
                }
            }
        } else {
          this.detail.querySelector('#eta').innerHTML = `<h4>tempo in macchina </h4><h3>Non ci è stato possibile calcolare</h3>`
        }
    })
  }

  notify(type,infos) {
    switch(type) {
      case 'HIDE_SINGLE':
        this.DOMElement.style.display = 'none'
        break;
      default:
        while(this.DOMElement.firstChild) {
          this.DOMElement.removeChild(this.DOMElement.firstChild)
        }
        this.DOMElement.appendChild(this.paintSingle(infos))
        this.calcEta(infos)
        this.DOMElement.style.display = 'flex'
        this.detail = this.DOMElement.querySelector('#content')
    }
  }
}

export default Single
