import React from 'react';
import './App.css';
import PropTypes from 'prop-types';
//import { } from '@mui/system';
import { Typography, Tab, Tabs, Box, Switch } from '@mui/material';
import { Thermostat, } from '@mui/icons-material';
import { initializeApp } from '@firebase/app';
import { getDatabase, ref, set, onValue, get, child } from '@firebase/database';

import Temperatures from './Temperatures';


const firebaseConfig = {
  // add firebase config here 
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export default function App() {

  const [value, setValue] = React.useState(0);
  //const [temperatures, setTemperatures] = React.useState();
  const [checked, setChecked] = React.useState(false);
  const [sensor1, setSensor1] = React.useState(0);
  const [sensor2, setSensor2] = React.useState(0);
  const [sensor3, setSensor3] = React.useState(0);


  // fetches data from DB upon startup
  React.useEffect(() => {
    getSensorReadings();
    getSwitchPos();
  }, []);


  // TabPanle component
  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (<Box>
          <Typography component={'span'}>{children}</Typography>
        </Box>)}
      </div>
    )
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };


  const allyProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tab-${index}`,
    };
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  // switch for turning on / off the heater
  const handleSwitch = (event) => {
    setChecked(event.target.checked)
    if (checked === true) {
      writeFirebaseOff();
    } else if (checked === false) {
      writeFirebaseOn();
    } else {
      console.log("error on switch");
    }
  }

  // writeFirebase sends wanted data to firebase
  const writeFirebaseOff = () => {
    set(ref(database, 'proto_loc1/Control/heater'), 2);
  }

  const writeFirebaseOn = () => {
    set(ref(database, 'proto_loc1/Control/heater'), 1);
  }

  // fetches sensor values from the database and assign them to states
  const getSensorReadings = () => {
    const getTemperatures = ref(database, 'proto_loc1/Sensor_readings');
    onValue(getTemperatures, (snapshot) => {
      const data = snapshot.val();
      setSensor1(data.sensor_1);
      setSensor2(data.sensor_2);
      setSensor3(data.sensor_3);
      //setTemperatures(data);
      console.log("received data : ", data);
    })
  }

  // defines switch handle position
  const getSwitchPos = () => {
    const getTemperatures = ref(database);
    get(child(getTemperatures, 'proto_loc1/Control/heater')).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        if (snapshot.val() === 1) {
          setChecked(true);
        } else if (snapshot.val() === 2) {
          setChecked(false);
        }
      } else {
        console.log("No data on this path");
      }
    }).catch((error) => {
      console.error(error);
    })
  }



  return (
    <div className="body">
      <div className="flexbox"
      /* style={{ 
           display: 'flex',
           flexDirection: 'column',              
           alignItems: 'center', 
           justifyContent: 'center',   
           backgroundColor: 'whitesmoke'
        }} */
      >
        <header className="header">
          <h1>Remote access to your Esp32</h1>
        </header>
        <Box sx={{/*width: '80%',*/ }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', color: 'darkorange', }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              textColor='inherit'
              TabIndicatorProps={{
                style: {
                  backgroundColor: 'orange'
                }
              }}
              centered
            >
              <Tab label="Heating" {...allyProps(0)} />
              <Tab label="Energy" {...allyProps(1)} />
              <Tab label="Overview" {...allyProps(2)} />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0} className="main">
            <div className="flexbox-row">

              <div className="first">
                <h3>Heating</h3>
                <Thermostat sx={{ color: 'orange', stroke: 'white', strokeWidth: 0.3, fontSize: 40 }} />
              </div>

              <div className="second">
                <h3>Sensor data</h3>
                <div style={{textDecoration: 'underline', marginBottom: 10}}>Sensor 1:  {sensor1.toFixed(1)}°C</div>
                <div style={{textDecoration: 'underline', marginBottom: 10}}>Sensor 2:  {sensor2.toFixed(1)}°C</div>
                <div style={{textDecoration: 'underline', marginBottom: 10}}>Sensor 3:  {sensor3.toFixed(1)}°C</div>
              </div>

              <div className="third">
                <h3>Heater controller</h3>

                <div> Heater off/on <Switch
                  color="warning"
                  checked={checked}
                  onChange={handleSwitch}
                />
                </div>

              </div>
            </div>

          </TabPanel>

          <TabPanel value={value} index={1} style={{ paddingTop: '4%' }}>
            <div className="second">
              Coming soon!
            </div>
          </TabPanel>

          <TabPanel value={value} index={2} className="main">
            <div className="flexbox-row">
              <div className="first">first</div>
              <div className="second"><Temperatures/></div>
              <div className="third">third</div>
            </div>
          </TabPanel>

        </Box>

      </div>
    </div>
  );
}
