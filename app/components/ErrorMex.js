class ErrorMex {
  constructor(bridge) {
    this.DOMElement = document.getElementById('error')
    bridge.registerObserver(this,'RAISE_ERROR','HIDE_ERROR')
    this.notify = this.notify.bind(this)
  }

  notify(type,result) {
    if (type === 'HIDE_ERROR') {
      this.DOMElement.style.display = 'none';
    } else {
      this.DOMElement.style.display = 'flex'
      this.DOMElement.innerHTML = '<h1>'+result+'</h1>'
    }
  }

}

export default ErrorMex
