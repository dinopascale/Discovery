import InputField from './InputField'
import ActionButton from './ActionButton'

class Navbar {
  constructor(bridge) {
    this.bridge = bridge
    this.DOMElement = document.querySelector('#inputbar')
    this.className = this.DOMElement.classList
    this.bridge.registerObserver(this,'CHANGE_SCENE')
    this.notify = this.notify.bind(this)

    this.backBtn = new ActionButton(this.bridge,this.DOMElement,'HIDE_SINGLE','','back-btn')
    this.inputField = new InputField(this.bridge,this.DOMElement)
    this.resetBtn = new ActionButton(this.bridge,this.DOMElement,'RESET_VALUE','','reset-btn')
  }

  notify(type,scene) {
    switch(scene) {
      case 'initial':
        this.DOMElement.classList = 'input-bar initial'
        break;
      case 'suggestion':
        this.DOMElement.classList = 'input-bar suggestion'
        break;
      case 'map':
        this.DOMElement.classList = 'input-bar map'
        break;
      case 'single':
        this.DOMElement.classList = 'input-bar single'
        break;
      case 'filter':
        this.DOMElement.classList = 'input-bar filter'
        break;
      default:
        this.DOMElement.classList = 'input-bar initial'
    }
  }
}

export default Navbar
