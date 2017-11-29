class InputField {
  constructor(bridge,parentDOM) {
    this.bridge = bridge
    this.timeout = null;
    this.parentDOM = parentDOM
    this.DOMElement = null;

    this.paint = this.paint.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.notify = this.notify.bind(this)
    this.updateValue = this.updateValue.bind(this)
    this.value = ''

    this.parentDOM.appendChild(this.paint())
    this.DOMElement = this.parentDOM.querySelector('#search-ipt')
    this.bridge.registerObserver(this,'SET_VALUE','RESET_VALUE')
  }

  handleInput(e) {
    clearTimeout(this.timeout)
    if(e.keyCode !== 16) {
      this.timeout = setTimeout(() => {
        this.bridge.sendAction('CREATE_SUGGESTION_LIST',e.target.value)
      },800)
    }
  }

  paint() {
    const frag = document.createDocumentFragment()

    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'search-ipt'
    input.className = 'bar-el search-ipt'
    input.placeholder = 'la tua posizione?'
    input.value = this.value
    input.addEventListener('keyup',this.handleInput,false)

    frag.appendChild(input)
    return frag
  }

  updateValue(value) {
    this.value = value
    this.DOMElement.value = this.value
  }

  notify(type,payload) {
    switch(type) {
      case 'SET_VALUE':
      case 'RESET_VALUE':
        this.updateValue(payload)
        break;
      default:
        console.log('no azioni conosciute');
    }
  }
}

export default InputField
