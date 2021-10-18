import React, { useEffect, useState, Fragment } from "react";
import { AiOutlineClose } from "@meronex/icons/ai";
import EmptyView from "./empty_view";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import { useProducts } from "../providers/productProvider";
import { useWatchlist } from "../providers/watchlistProvider";
import CheckoutPopup, { CheckoutPage } from "./cart-checkout-popup";

const QuickWatchlistView = () => {
  const { fetchProductById, reduceWatch, unholdProduct } = useProducts();
  const { removeFromWatchlist, watchlist, checkOut } = useWatchlist();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(getCheckoutTally());
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    setAmount(getCheckoutTally());
    // const timeout = setTimeout(()=>setOpen(false), 2000)
    // return ()=>{
    //     clearTimeout(timeout)
    // }
  }, [checkOut, watchlist]);

//   useEffect(() => {
//     setRemoved(false);
//   }, [watchlist, removed, checkOut]);

  function getCheckoutTally() {
    let output = 0.0;
    checkOut.forEach((itemId) => {
      output += parseFloat(fetchProductById(itemId).price);
    });
    return output;
  }

  const handleRemove = (product) => {
    if (product.heldBy === user.uid) unholdProduct(user.uid, product);
    removeFromWatchlist(product.id);
    reduceWatch(product);
    setRemoved(true);
  };

  return (
    <div
      className={`quick-watchlist-view ${open ? "show" : ""} ${
        watchlist.length > 0 ? "max" : ""
      }`}
    >
      <div onClick={() => setOpen(false)} className="overlay"></div>
      <div className="inner-wrapper">
        <div onClick={() => setOpen(!open)} className="toggler">
          {open ? "Hide" : "Show"} Cart{" "}
          {watchlist.length > 0 ? `(${watchlist.length})` : ""}
        </div>
        <div className="body-wrap">
          <div className="watchlist-list">
            {watchlist.map((item) => (
              <WatchItem
                userId={user.uid}
                onRemove={handleRemove}
                key={item.id}
                data={item}
              />
            ))}
            {checkOut.length < 1 ? (
              <EmptyView message="Your cart is empty" useIcon={false} />
            ) : (
              <Fragment></Fragment>
            )}
          </div>
        </div>
        {watchlist.length ? <CheckoutPage /> : <Fragment></Fragment>}
      </div>
      <style jsx>{`
        .quick-watchlist-view {
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 10;
          max-height: 40px;
        }

        .quick-watchlist-view.show {
          pointer-events: all;
          max-height: 90px;
        }
        .quick-watchlist-view.show.max {
          max-height: 100%;
        }

        .quick-watchlist-view .overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          transition: all 0.15s linear;
          cursor: pointer;
        }
        .quick-watchlist-view.show .overlay {
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          background: #0001;
          pointer-events: all;
        }

        .quick-watchlist-view .toggler {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          font-size: 12px;
          background: #222;
          border-top-right-radius: 10px;
          border-top-left-radius: 10px;
          cursor: pointer;
          color: #fff;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .quick-watchlist-view .inner-wrapper {
          height: 100%;
          max-height: 0%;
          background: #fff;
          transition: max-height 0.25s ease-out;
          width: 90%;
          max-width: 700px;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 0 10px 5px #0002;
          display: flex;
          flex-direction: column;
        }

        .quick-watchlist-view.show .inner-wrapper {
          max-height: 85%;
        }

        .quick-watchlist-view .body-wrap {
          display: flex;
          align-items: center;
          padding: 0 5%;
        }

        .quick-watchlist-view .watchlist-list {
          min-height: 60px;
          display: flex;
          align-items: center;
          flex: 1;
          overflow-x: auto;
          margin-right: 10px;
          padding: 10px 0px;
        }
        .quick-watchlist-view .watchlist-list::-webkit-scrollbar {
          display: none;
        }

        .watchlist-list .item {
          animation: bounce 0.3s cubic-bezier(0.36, 0.63, 0, 1.32);
        }

        .watchlist-list .item:not(:last-child) {
          margin-right: 20px;
        }
        .watchlist-list .item.held img {
          filter: blur(1px);
        }

        .watchlist-list .item .remove-btn {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: red;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .watchlist-list .item img {
          width: 55px;
          height: 55px;
          object-fit: cover;
          border-radius: 10px;
          border: 5px solid #eee;
        }

        @keyframes bounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .quick-watchlist-view .btn {
          padding: 10px 20px;
          background: var(--dark-color);
          color: #fff;
          border-radius: 10px;
          font-size: 13px;
        }
        .quick-watchlist-view .checkout-btn-box p {
          margin-bottom: 10px;
          font-weight: bolder;
          text-align: center;
          color: var(--dark-color);
        }
      `}</style>
    </div>
  );
};

const WatchItem = ({ data, onRemove, userId }) => {
  const [product, setProduct] = useState(null);
  const [held, setHeld] = useState(false);
  const [heldByMe, setHeldByMe] = useState(false);
  const { fetchProductById } = useProducts();

  useEffect(async () => {
    const result = await fetchProductById(data.productId);
    if (result) {
      setProduct(result);
      setHeld(result.status === 1);
      setHeldByMe(result.heldBy === userId);
    }
  }, []);

  return product ? (
    <div className={`item ${held && !heldByMe ? "held" : ""}`}>
      <Link to={"/preview-product/" + product.id}>
        <img src={product.imageUrl} alt="watchlist item" />
      </Link>
      <div onClick={() => onRemove(product)} className="remove-btn">
        <AiOutlineClose color="white" size={10} />
      </div>
    </div>
  ) : (
    <Fragment />
  );
};

export default QuickWatchlistView;
