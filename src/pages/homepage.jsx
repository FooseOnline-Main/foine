import '../css/home.css';

import React, { Fragment, useEffect, useState } from 'react';
import { Route, useHistory } from "react-router-dom";

import FloatNotifications from '../components/float_notifications';
import ErrorPopup from '../components/error-popup';
import HomeHeader from '../components/home_header';
import LiveFeedSection from '../components/feed_section';
import LoginForm from '../components/login_form';
import ProductViewPage from '../components/product_view_page';
import ProfilePopup from '../components/profile_popup';
import QuickWatchlistView from '../components/quick_watchlist_view';
import SignupForm from '../components/signup_form';
import NotificationPopup from '../components/notification_popup';
import NegotiationPopup from '../components/negotiation_popup';
import QuickPay from '../components/quick-pay';
import { useWatchlist } from '../providers/watchlistProvider';

const HomePage = () => {
    const [searchString, setSearchString] = useState("");
    const {quickCheckout} = useWatchlist();
    const history = useHistory();

    const handleSearch = (string)=>{
        setSearchString(string);
    }

  useEffect(()=>{
    if(quickCheckout.length > 0){
      history.push("/quick-checkout")
    }
  }, [quickCheckout])

    history.listen(()=>{
        document.body.style.overflow = "auto";     
    });

    return (
        <div id='homepage'>
            <Fragment>
                <HomeHeader onSearch={handleSearch} />
                <div className="page-body">
                    <LiveFeedSection />
                </div>
                <QuickWatchlistView />
                <FloatNotifications />
                <Route path="/login">
                    <LoginForm />
                </Route>
                <Route path="/signup">
                    <SignupForm />
                </Route>
                <Route path="/preview-product/:id">
                    <ProductViewPage />
                </Route>
                <Route path="/notifications">
                    <NotificationPopup />
                </Route>
                <Route path="/negotiate/:reqId">
                    <NegotiationPopup />
                </Route>
                <Route path="/profile" >
                    <ProfilePopup />
                </Route>
                <Route path="/quick-checkout">
                    <QuickPay data={quickCheckout} />
                </Route>
                <ErrorPopup />
            </Fragment>
        </div>
    );
}

export default HomePage;
