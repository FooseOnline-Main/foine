import React, {useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import HomePage from "./pages/homepage";
import AddProdPage from "./pages/addprod";
import { useWatchlist } from "./providers/watchlistProvider";
import { useAuth } from "./providers/authProvider";
import Loader from "./components/simple_loader";

function App() {
  const {user} = useAuth();
  const {getWatchlist} = useWatchlist();

  useEffect(() => {
      getWatchlist(user.uid);
  }, [user]);

  return (
    <div className="App">
      {!user ? <Loader expand={true} /> :
      <Router>
        <Switch>
          <Route path="/addProduct">
            <AddProdPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
    </Router>}
    </div>
  );
}

export default App;
