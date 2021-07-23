// firebaseConfig.js
// Contains the config details of firebase, this should NOT be committed to your repo
// if the repo is public
// You could optionally use .env file to store these data

const value = (process.env.REACT_APP_FIREBASE_CONFIG).toString();
console.log(value, JSON.parse(value));
const configuration = JSON.parse(value);

export default configuration;
