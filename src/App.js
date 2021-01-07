import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl,Select, Card, CardContent } from "@material-ui/core"
import './App.css';
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import {sortData} from './util'
import {prettyPrintStat} from './util'
import {prettyPrintStat2} from './util'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"

function App() {
  //state is basically a variable in react
  const [countries, setCountries]=useState([]);
  const [country, setCountry]=useState("worldwide")
  const [countryInfo, setCountryInfo]=useState({})
  const [tableData, setTableData]=useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng:-40.4796})
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setmapCountries] = useState([])
  const [casesType, setcasesType] = useState("cases")

  //useEffect() runs piece of code based on given conditon
  useEffect(() => {
    //runs when loads and when countries changes
    //async sends a request to a server, waits for it, then does something with the info
    const getCountriesData = async () => {
      //disease.sh API 
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2
        }));
        const sortedData = sortData(data)
        setTableData(sortedData)
        setCountries(countries);
        setmapCountries(data)
      });
    };
    getCountriesData();
  }, [countries]);
  
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  const onCountryChange = async(event) => {
    const countryCode=event.target.value;
    setCountry(countryCode)

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then (data =>{
        setCountryInfo(data)
        setCountry(countryCode)
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)

      })
  } 
  console.log("iufruiefb",countryInfo)

  return (
    <div className="app">
      
      <div className="app__left">

      <div className="app__header"> {/*header and dropdown*/}
      <h1>COVID-19 Tracker</h1>
      <FormControl className="app__dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>
        <MenuItem value="worldwide">Worldwide</MenuItem>
        {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
        </Select>
      </FormControl>
      </div>

      <div className="app__stats"> {/*buttons/infoboxes*/}
        <InfoBox 
        isRed
        active={casesType==="cases"}
        title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat2(countryInfo.cases)}
        onClick={e=> setcasesType('cases')}/>
        
        <InfoBox 
        active={casesType==="recovered"}
        title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat2(countryInfo.recovered)}
        onClick={e=> setcasesType('recovered')}/>
        
        <InfoBox 
        isRed
        active={casesType==="deaths"}
        title="Death" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat2(countryInfo.deaths)}
        onClick={e=> setcasesType('deaths')}/>
      </div>

       
      {/*Map*/}
      <Map countries={mapCountries}center={mapCenter} zoom={mapZoom} casesType={casesType}/>
    </div>
      
      <Card className="app_right">
        <CardContent>
        {/*Table*/}
        <h3>Live Cases by Country</h3>
        <Table countries={tableData}/>

        {/*Graph*/}
        <h3 class="app__graphTitle">Worldwide New {casesType}</h3>
        <LineGraph  className="app__graph" casesType={casesType}/>
        </CardContent>
    </Card>
    </div>
  );
}

export default App;
