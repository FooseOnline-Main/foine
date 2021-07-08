import '../css/home.css';

import React, { useState } from 'react';
import { Route, useHistory } from "react-router-dom";

import CheckoutPopup from '../components/cart-checkout-popup';
import FloatNotifications from '../components/float_notifications';
import ErrorPopup from '../components/error-popup';
import GalleryViewSection from '../components/gallery-view-section';
import HomeHeader from '../components/home_header';
import LiveFeedSection from '../components/feed_section';
import LoginForm from '../components/login_form';
import PrivateRoute from '../hooks/private_router';
import ProductViewPage from '../components/product_view_page';
import ProfilePopup from '../components/profile_popup';
import QuickWatchlistView from '../components/quick_watchlist_view';
import SignupForm from '../components/signup_form';

const HomePage = () => {
    const [searchString, setSearchString] = useState("");
    const [quickOpenNotifications, setQuickOpenNotifications] = useState(false);
    const history = useHistory();

    const handleSearch = (string)=>{
        document.querySelector('.page-body').scrollBy({top: 10, behavior: "smooth"});
        setSearchString(string);
    }

    history.listen(()=>{
        document.body.style.overflow = "auto";     
    });

    const handleQuickOpen = ()=>{
        setQuickOpenNotifications(true);
        setTimeout(()=>{ setQuickOpenNotifications(false) }, 150);
    }

    return (
        <div id='homepage'>
            <>
                <HomeHeader onSearch={handleSearch} onQuickOpenNotifications={handleQuickOpen} />
                <div className="page-body">
                    <LiveFeedSection />
                    <GalleryViewSection searchValue={searchString}/>
                </div>
                <QuickWatchlistView />
                <FloatNotifications quickOpen={quickOpenNotifications} />
                <Route path="/login">
                    <LoginForm />
                </Route>
                <Route path="/signup">
                    <SignupForm />
                </Route>
                <Route path="/watchlist">
                    <CheckoutPopup />
                </Route>
                <Route path="/preview-product/:id">
                    <ProductViewPage />
                </Route>
                <PrivateRoute path="/profile" component={ProfilePopup} />
                <ErrorPopup />
            </>
        </div>
    );
}

export default HomePage;
