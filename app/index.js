import './es6-polyfill'
import Bridge from './bridge'
//import InputField from './components/InputField'
import Navbar from './components/Navbar'
import SuggestionList from './components/SuggestionList'
import ErrorMex from './components/ErrorMex'
import Map from './components/Map'
import Single from './components/Single'
import Filter from './components/Filter'


const bridge = new Bridge()
const map = new Map(bridge)
const navbar = new Navbar(bridge)
//const inputField = new InputField(bridge)
const suggestionList = new SuggestionList(bridge)
const errorMex = new ErrorMex(bridge)
const single = new Single(bridge)
const filter = new Filter(bridge)
