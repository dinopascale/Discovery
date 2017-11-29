import ActionButton from './ActionButton'

const mapsOption = {
  maxZoom:16,
  minZoom:6,
  zoom:11,
  center:{lat:42.4047600,lng:12.8573500},
  disableDefaultUI: true,
  styles: [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
]
              }

class Map {
  constructor(bridge) {
    this.bridge = bridge;
    this.map = null;
    this.markerArrays = []
    this.center = {}
    this.zoom = 0

    this.initMap = this.initMap.bind(this)
    this.addMarker = this.addMarker.bind(this)
    this.checkInBounds = this.checkInBounds.bind(this)
    this.clearMarkerFromMap = this.clearMarkerFromMap.bind(this)
    this.setCenter = this.setCenter.bind(this)
    this.handleClickMarker = this.handleClickMarker.bind(this)

    this.DOMElement = document.getElementById('map')
    window.initMap = this.initMap
    const filterButton = new ActionButton(this.bridge,this.DOMElement,'SHOW_FILTER','','filter')

    this.bridge.registerObserver(this,'ADD_MARKER','SET_CENTER','HIDE_MAP','HIDE_SINGLE')
  }

  initMap() {
    this.map = new google.maps.Map(this.DOMElement.querySelector('#mapwrapper'),mapsOption)
    this.bridge.sendAction('ADD_MARKER')
  }

  addMarker(arr) {
    const self = this
    console.log('information', arr)
    for(let i = 0,len=arr.length;i<len;i++) {
        let marker = new google.maps.Marker({
            position:arr[i]['geo'],
            map:this.map,
            id:arr[i]['id'],
            info: arr[i]['info'],
        });
        this.markerArrays.push(marker)
        marker.addListener('click',() => {
          self.handleClickMarker(marker)
        })
    }
    const markerCluster = new MarkerClusterer(this.map, this.markerArrays,{imagePath: './assets/img/m'});
  }

  checkInBounds(zoom,bounds) {
    let markersInBounds = 0;
    for(let i=0,len = this.markerArrays.length;i<len && markersInBounds === 0;i++) {
        if(bounds.contains(this.markerArrays[i].getPosition())) {
            markersInBounds++;
        }
    }
    if(markersInBounds === 0) {
        zoom--;
        this.map.setZoom(zoom);
        const b = this.map.getBounds()
        this.iteration++;
        this.checkInBounds(zoom,b)
    } else {
        this.map.fitBounds(bounds);
        return false;
    }
  }

  clearMarkerFromMap() {
    for (let i = 0, len = this.markerArrays.length; i < len; i++) {
          this.markerArrays[i].setMap(null);
        }
  }

  handleClickMarker(marker) {
    const props = {
      lt: marker.position.lat(),
      ln: marker.position.lng(),
      info: marker.info,
      clt: this.center.lat(),
      cln: this.center.lng()
    }
    this.zoom = this.map.getZoom()
    this.center = this.map.getCenter()
    this.map.panTo(marker.position)
    this.map.setZoom(16)
    this.bridge.sendAction('REQUEST_SINGLE',props)
  }

  setCenter(center) {
    this.map.setCenter(center);
    const z = this.map.getZoom()
    const bounds = this.map.getBounds()
    this.checkInBounds(z,bounds)
    const centerMarker = new google.maps.Marker({
        position:center,
        animation: google.maps.Animation.DROP,
        map:this.map,
        icon:'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    this.center = this.map.getCenter()
  }

  notify(mex,payload) {
    console.log('mex da map', mex);
    switch(mex) {
      case 'HIDE_MAP':
        this.DOMElement.style.opacity = 0;
        this.DOMElement.style.pointerEvents = 'none'
        break;
      case 'SET_CENTER':
        this.clearMarkerFromMap()
        this.map.setZoom(mapsOption.zoom)
        this.setCenter(payload)
        this.DOMElement.style.opacity = 1;
        this.DOMElement.style.pointerEvents = 'auto'
        break;
      case 'HIDE_SINGLE':
        this.map.panTo(this.center)
        this.map.setZoom(this.zoom)
        break;
      default:
        this.addMarker(payload)
    }
  }
}

export default Map
