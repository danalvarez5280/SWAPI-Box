import React, { Component } from 'react';
import './App.css';
import DataCleaner from './Helpers/DataCleaner'
import CardContainer from './components/CardContainer/CardContainer'
import Scroll from './components/Scroll/Scroll'
import DisplayButton from './components/DisplayButton/DisplayButton'

class App extends Component {
  constructor() {
    super();
    this.dataCleaner = new DataCleaner
    this.state = {
      data: undefined,
      peopleArray: [],
      planetsArray: [],
      vehicleArray: [],
      scrollData: [],
      favorites: []
    }
    this.grabStarWarsData = this.grabStarWarsData.bind(this)
  }

//onClick of button, we pass the text as the api we're trying to call and put it into the url

grabStarWarsData() {
  this.dataCleaner.apiCall()
  .then(() => {
    this.setState({
      data: this.dataCleaner,
      scrollData: this.dataCleaner.scrollData.results
    })
  })
  .catch((e) => {
    console.log('API ERROR: ', e)
  })
}

componentDidMount() {
  this.grabStarWarsData()
}

addToFavorites() {

}

removeFromFavorites() {

}

showFavorites() {

}

showPeople() {
  const { results } = this.state.data.peopleData
  let homeworldPromises = this.state.data.peopleData.results.map((person) =>
    fetch(person.homeworld)
        .then(planet => planet.json())
    )
  let updatedArrayOfPeople = Promise.all(homeworldPromises)
    .then(array => array.map((planet, i) => {
      return Object.assign({planet: planet.name, population: planet.population}, this.state.data.peopleData.results[i])
    })
  ).then(result => this.getSpecies(result))
}

getSpecies(result) {
  let speciesList = result.map((person) => person.species[0])

  let speciesPromises = speciesList.map((species) =>
    fetch(species)
      .then(data => data.json())
    )

  let speciesArray = Promise.all(speciesPromises)
    .then(arrayOfSpecies => arrayOfSpecies.map((species, i) => {
      return Object.assign({}, result[i], {species: species.name}, {hasBeenSelected: false})
    }))
    .then(result2 => this.setState({
      peopleArray: result2,
      planetsArray: [],
      vehicleArray: [],
      scrollData: []
    }))
}

showPlanets() {
  let resArray = []
  const { results } = this.state.data.planetData
  let residentsArray = results.map((planet, i) => {
    let linkArray = planet.residents.map((link) => {
      return fetch(link)
                  .then(data => data.json())

    })
    return Promise.all(linkArray)
    .then(thing => {
      return Object.assign(planet, {residents: thing.map((person) => person.name)}, {hasBeenSelected: false})
    }).then(result => result)
  })

  Promise.all(residentsArray)
  .then(response => this.setState({
    planetsArray: response,
    peopleArray: [],
    vehicleArray: [],
    scrollData: []
  }))
}

showVehicles() {
  const { results } = this.state.data.vehicleData
  Object.keys(results).map((planet, i) => results[i].hasBeenSelected = false)
  this.setState({
    vehicleArray: results,
    peopleArray: [],
    planetsArray: [],
    scrollData: []
  })
}

  render() {
    return (
      <div className="App">
        Hey There Hot Stuff

        <DisplayButton clickEvent={this.showPeople.bind(this)} btnText={'People'}/>
        <DisplayButton clickEvent={this.showPlanets.bind(this)} btnText={'Planets'}/>
        <DisplayButton clickEvent={this.showVehicles.bind(this)} btnText={'Vehicles'}/>
        <DisplayButton clickEvent={this.showFavorites.bind(this)} btnText={'Favorites'}/>

        <CardContainer info={ this.state.peopleArray } addToFavorites={this.addToFavorites.bind(this)} removeFromFavorites={this.removeFromFavorites.bind(this)} />
        <CardContainer info={ this.state.planetsArray } addToFavorites={this.addToFavorites.bind(this)} removeFromFavorites={this.removeFromFavorites.bind(this)} />
        <CardContainer info={ this.state.vehicleArray } addToFavorites={this.addToFavorites.bind(this)} removeFromFavorites={this.removeFromFavorites.bind(this)} />

        <Scroll scrollArray={this.state.scrollData} />
      </div>
    );
  }
}

export default App;
