import feathers, {socketio} from '@feathersjs/client';
import io from 'socket.io-client';
// import rest from '@feathersjs/rest-client';

const host = process.env.NODE_ENV === "production" ? "https://foine-feathers.herokuapp.com" :
"http://localhost:3030";

const socket = io(host);

export const app = feathers()
.configure(feathers.authentication({ store: window.localStorage }))
// .configure(rest(host).fetch(window.fetch))
.configure(socketio(socket))
