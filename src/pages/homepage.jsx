import '../css/home.css';

import React, { useEffect, useState } from 'react';
import { Route, useHistory } from "react-router-dom";

import CheckoutPopup from '../components/cart-checkout-popup';
import DesktopNotifications from '../components/notifications';
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
import { useProducts } from '../providers/productProvider';

const HomePage = () => {
    const [searchString, setSearchString] = useState("");
    const history = useHistory();

    const handleSearch = (string)=>{
        document.querySelector('.page-body').scrollBy({top: 10, behavior: "smooth"});
        setSearchString(string);
    }

    history.listen(()=>{
        document.body.style.overflow = "auto";     
    });

    return (
        <div id='homepage'>
            <>
                <HomeHeader onSearch={handleSearch} />
                <div className="page-body">
                    <LiveFeedSection />
                    <GalleryViewSection searchValue={searchString}/>
                </div>
                <QuickWatchlistView />
                <DesktopNotifications />
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
