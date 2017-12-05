class SuggestionList {
  constructor(bridge) {
    this.bridge = bridge;
    this.maxSuggestion = 6;

    this.notify = this.notify.bind(this)
    this.paintList = this.paintList.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleResize = this.handleResize.bind(this)

    this.DOMElement = document.getElementById('suggestion')
    this.DOMLayoutBar = document.getElementById('leftbar')
    this.DOMElement.addEventListener('click',this.handleClick)
    this.bridge.registerObserver(this,'CREATE_SUGGESTION_LIST','HIDE_SUGGESTION','SHOW_SUGGESTION')
    //window.addEventListener('resize',this.handleResize,false)
  }

  handleResize() {
    this.DOMElement.style.height = `${window.innerHeight- 65}px`
  }

  handleClick(ev) {
    const single = ev.target.closest('.single-el')
    if(!single) return;
    const datasetGeo = single.dataset.geo,
          separator = datasetGeo.indexOf('_'),
          geometry = {
            lat : parseFloat(datasetGeo.slice(0, separator)),
            lng : parseFloat(datasetGeo.slice(separator+1)),
            name: single.dataset.name,
            prov: single.dataset.prov
          }
    this.bridge.sendAction('SET_CENTER',geometry)
  }

  notify(type,result) {
    switch(type) {
      case 'SHOW_SUGGESTION':
        this.DOMElement.style.display = 'flex'
        break;
      case 'HIDE_SUGGESTION':
        this.DOMElement.style.display = 'none'
        break;
      default:
        this.paintList(result)
    }
  }

  paintList(result) {
    console.log('result ',result);
    while(this.DOMElement.firstChild) {
      this.DOMElement.removeChild(this.DOMElement.firstChild)
    }
    if(result.length === 0) {
      this.DOMElement.innerHTML = `
                                  <div class="break"></div>
                                  <h2>UH-OH!!</h2>
                                  <h3>Sembra che tu abbia inserito un comune non esistente<br/><br/>
                                  Sicuro non volessi scrivere qualcos'altro?</h3>
                                  `
    }
    result.length = (result.length<this.maxSuggestion) ? result.length : this.maxSuggestion
    const frag = document.createDocumentFragment()
    for(let i = 0, len = result.length; i<len;i++) {
      frag.appendChild(this.paintSingle(result[i]))
    }
    this.DOMElement.appendChild(frag);
    this.DOMElement.style.display = 'flex';
  }

  paintSingle(props) {
    const single = document.createElement('div')
    const nameLength = 15 //MAX length for cities name
    single.className = 'single-el'
    single.style = `height:${100/this.maxSuggestion}%`
    single.setAttribute('data-geo',props.lt+'_'+props.ln)
    props.n = props.n.length < nameLength ? props.n : props.n.slice(0,nameLength-1)+'...'
    single.setAttribute('data-name',props.n)
    single.setAttribute('data-prov',props.p)
    single.innerHTML = `<h4>${props.n} <span style="color:#999; font-size:1.3rem">(${props.p})</span></h4>`
    return single
  }

}

export default SuggestionList
