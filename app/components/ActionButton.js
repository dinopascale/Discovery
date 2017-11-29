class ActionButton {
  constructor(bridge,parentDOM,type = '',payload = '',name = '') {
    this.bridge = bridge
    this.parent = parentDOM
    this.typeOfAction = type
    this.payload = payload
    this.name = name
    this.handleClick = this.handleClick.bind(this)
    this.paint = this.paint.bind(this)

    parentDOM.appendChild(this.paint())
  }

  handleClick() {
    (this.typeOfAction === 'HIDE_SINGLE')
      ? this.bridge.sendAction(this.typeOfAction,this.parent.classList)
      : this.bridge.sendAction(this.typeOfAction,this.payload)
  }

  paint() {
    const frag = document.createDocumentFragment()

    const div = document.createElement('div')
    div.className = `action-button ${this.name}`
    div.addEventListener('click',this.handleClick)

    frag.appendChild(div)
    return frag
  }

}

export default ActionButton
