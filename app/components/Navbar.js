import InputField from './InputField'
import ActionButton from './ActionButton'

class Navbar {
  constructor(bridge) {
    this.bridge = bridge
    this.DOMElement = document.querySelector('#inputbar')
    this.DOMLayoutBar = document.getElementById('leftbar')
    this.className = this.DOMElement.classList
    this.bridge.registerObserver(this,'CHANGE_SCENE')
    this.notify = this.notify.bind(this)

    this.inputField = new InputField(this.bridge,this.DOMElement)
    this.resetBtn = new ActionButton(this.bridge,this.DOMElement,'RESET_VALUE','','reset-btn')
    this.backBtn = new ActionButton(this.bridge,this.DOMElement,'HIDE_SINGLE','','back-btn')
  }

  notify(type,scene) {
    switch(scene) {
      case 'initial':
        this.DOMElement.classList = 'input-bar initial'
        this.DOMLayoutBar.style.transform = `translateX(0)`
        break;
      case 'suggestion':
        this.DOMElement.classList = 'input-bar suggestion'
        this.DOMLayoutBar.style.transform = `translateX(0)`
        break;
      case 'map':
        this.DOMElement.classList = 'input-bar map'
        this.DOMLayoutBar.style.transform = `translateX(-100vw)`
        break;
      case 'single':
        this.DOMElement.classList = 'input-bar single'
        this.DOMLayoutBar.style.transform = `translateX(0)`
        break;
      case 'filter':
        this.DOMElement.classList = 'input-bar filter'
        this.DOMLayoutBar.style.transform = `translateX(0)`
        break;
      case 'close_left':
        this.DOMLayoutBar.style.transform = 'translateX(-100vw)'
        break;
      default:
        this.DOMElement.classList = 'input-bar initial'
    }
  }
}

export default Navbar
