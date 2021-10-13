import { AiOutlineSearch } from "@meronex/icons/ai";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
// import { useNotification } from '../providers/notificationProvider';
import {
  MdcAccountCircleOutline,
  MdcChevronDown,
  MdcClose,
} from "@meronex/icons/mdc";
import { FiShoppingBag, FiUser } from "@meronex/icons/fi";
import { usePaystackPayment } from "react-paystack";
import { useWatchlist } from "../providers/watchlistProvider";
import { useProducts } from "../providers/productProvider";
import InputBox from "./input_box";
import firebase from "../firebase";

const HomeHeader = ({ onSearch }) => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { fetchProductById, reduceWatch } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState({
    provider: "mtn",
    phone: "",
    otp: {
      reference: "",
      otp: "",
    },
  });

  const tempCheckoutRef = firebase.firestore().collection("tempCheckout");
  const ordersRef = firebase.firestore().collection("orders");
  const productsRef = firebase.firestore().collection("products");
  const watchListRef = firebase.firestore().collection("watchlist");

  useEffect(() => {
    setProducts([]);
    setTotalPrice(0);
    watchlist.forEach(async (item) => {
      const data = await fetchProductById(item.productId);
      if (data) {
        setProducts((old) => [...old, data]);
        setTotalPrice((old) =>
          (parseFloat(data.price) + parseFloat(old)).toFixed(2)
        );
      }
    });
  }, [watchlist, setProducts, setTotalPrice]);

  const config = {
    email: "myfoine@gmail.com",
    amount: totalPrice * 100,
    publicKey: `${process.env.REACT_APP_PAY_KEY}`,
    reference: new Date().getTime().toString(),
    currency: "GHS",
  };

  const { user } = useAuth();

  const onSuccess = (reference) => {
    console.log("success", reference);
    tempCheckoutRef
      .where("reference", "==", config.reference)
      .get()
      .then(({ docs }) => {
        const result = docs.map((doc) => doc.data())[0];

        if (result) {
          tempCheckoutRef.doc(result.userDetails.id).delete();

          ordersRef
            .doc()
            .set({ ...result, paymentDetails: { amount: result.amount } });

          result.products.forEach((product) => {
            productsRef
              .doc(product.id)
              .update({ status: 2, heldBy: "", sold: true });

            watchListRef
              .where("productId", "==", product.id)
              .get()
              .then(({ docs }) => {
                const found = docs.map((doc) => doc.data());
                found.forEach((item) =>
                  watchListRef.doc(item.id).update({ paid: true })
                );
                setTimeout(
                  () =>
                    found.forEach((item) => watchListRef.doc(item.id).delete()),
                  5000
                );
              });
          });
        }
      });
  };

  const onClose = () => {
    setLoading(false);
    setFormData({
      provider: "mtn",
      phone: "",
      otp: {
        reference: "",
        otp: "",
      },
    });
  };

  const initPayment = usePaystackPayment(config);

  const handlePay = async () => {
    setLoading(true);
    const temp = {
      userDetails: { id: user.uid, phone: formData.phone },
      products,
      amount: totalPrice,
    };

    tempCheckoutRef.doc(user.uid).set({ ...temp, reference: config.reference });

    initPayment(onSuccess, onClose);
  };

  return (
    <div className="home-header">
      <h4 style={{ color: "#222", whiteSpace: "nowrap" }}>
        <span>
          <img src={process.env.PUBLIC_URL + "/fologo.png"} alt="foine logo" width={30} />
        </span>
      </h4>
      <div className="search-form">
        <AiOutlineSearch size={20} color="#555" />
        <input
          onChange={({ target: { value } }) => onSearch(value)}
          type="text"
          placeholder="Search by name or category"
          aria-placeholder="Search by name or category"
          className="search-input"
        />
      </div>
      <button className="profile-button">
        <FiShoppingBag size={22} color="#555" />
        {watchlist.length ? (
          <div className="tag">{watchlist.length}</div>
        ) : (
          <Fragment></Fragment>
        )}
        <div style={{ minWidth: 210 }} className="drop-down">
          <p>All Items</p>
          <div className="items-box">
            {products.map((item) => (
              <div
                key={item.id}
                style={{ backgroundImage: `url(${item.imageUrl})` }}
                className="item"
              >
                <div
                  key={item.id}
                  onClick={() => {
                    removeFromWatchlist(item.id);
                    reduceWatch(item);
                  }}
                  className="remover"
                >
                  <MdcClose size={20} color="#ffff" />
                </div>
              </div>
            ))}
          </div>
          <div className="providers">
            <div
              onClick={() => setFormData({ ...formData, provider: "mtn" })}
              className={`prov ${formData.provider === "mtn" ? "active" : ""}`}
            >
              MTN
            </div>
            <div
              onClick={() => setFormData({ ...formData, provider: "vod" })}
              className={`prov ${formData.provider === "vod" ? "active" : ""}`}
            >
              Vodafone
            </div>
            <div
              onClick={() => setFormData({ ...formData, provider: "tgo" })}
              className={`prov ${formData.provider === "tgo" ? "active" : ""}`}
            >
              Airtel/Tigo
            </div>
          </div>
          <div style={{ padding: "0 10px" }}>
            <InputBox
              style={{ padding: 5 }}
              value={formData.phone}
              onChange={({ target: { value } }) => {
                setFormData({ ...formData, phone: value });
              }}
              placeholder="Enter phone number..."
            />
          </div>
          <div className="checkout-space">
            <button style={{ flex: 1 }} disabled={loading} onClick={handlePay}>
              Pay Bulk
            </button>
            <div className="sub-total">
              {loading ? <small>loading..</small> : <small>GH&cent;</small>}{" "}
              <b>{totalPrice}</b>
            </div>
          </div>
        </div>
      </button>
      {user.isAnonymous ? (
        <button className="profile-button">
          <FiUser size={22} color="#555" />
          <MdcChevronDown size={18} color="#555" />
          <div className="drop-down">
            <Link to="/login" className="item">
              Log In
            </Link>
            <Link to="/signup" className="item">
              Signup
            </Link>
          </div>
        </button>
      ) : (
        <Fragment>
          <Link to="/profile" className="profile-button">
            <MdcAccountCircleOutline size={25} color="#555" />
          </Link>
        </Fragment>
      )}
      <style jsx>{`
        .home-header {
          padding: 10px 2.5%;
          display: flex;
          align-items: center;
          column-gap: 20px;
          background: #fff;
          color: #222;
        }

        .home-header .search-form {
          border-radius: 20px;
          flex: 1;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          padding: 0 15px;
        }

        @media (max-width: 500px) {
          .home-header .search-form {
            display: flex;
          }
        }

        @media (max-width: 400px) {
          .home-header .search-form {
            width: 50px;
            overflow: hidden;
          }
        }

        .search-form input {
          border: none;
          background: transparent;
          padding: 10px 15px;
          outline: none;
          flex: 1;
          font-size: 12px;
        }

        .search-form input::-webkit-input-placeholder {
          font-size: 12px;
          color: #aaa;
        }

        .profile-button {
          border-radius: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-family: var(--font-bold);
          color: #222;
          cursor: pointer;
          border: none;
          background: transparent;
        }

        .profile-button .drop-down {
          position: absolute;
          top: 130%;
          right: 0;
          padding: 5px 0;
          transform: translateY(10px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.15s linear;
          background: #fff;
          box-shadow: 0 0 10px 1px #00000010;
          border-radius: 8px;
          z-index: 10;
          min-width: 150px;
          overflow: hidden;
        }

        .profile-button .items-box {
          padding: 10px;
          display: flex;
          column-gap: 10px;
          flex-wrap: wrap;
          max-height: 220px;
          min-height: 120px;
          overflow: auto;
        }
        .profile-button .items-box::-webkit-scrollbar {
          display: none;
        }

        .profile-button .items-box .item {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #eee;
          margin-bottom: 10px;
          background-size: cover;
          background-position: center;
        }
        .profile-button .items-box .item .remover {
          position: absolute;
          inset: 0;
          opacity: 0;
          width: inherit;
          height: inherit;
          border-radius: inherit;
          display: grid;
          place-items: center;
          background-color: #0005;
        }
        .profile-button .items-box .item:hover .remover {
          opacity: 1;
        }
        .profile-button .providers {
          display: flex;
          column-gap: 10px;
          padding: 10px;
          align-items: center;
          justify-content: space-between;
        }
        .profile-button .providers .prov {
          padding: 5px 10px;
          font-size: 10px;
          border: 1px solid #222;
          color: #222;
          border-radius: 20px;
        }
        .profile-button .providers .prov.active {
          background: #222;
          color: #ffff;
        }
        .profile-button .checkout-space {
          display: flex;
          justify-content: space-between;
          column-gap: 10px;
          padding: 10px;
          padding-top: 0;
          align-items: center;
        }

        .checkout-space button {
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: #222;
          color: #fff;
          cursor: pointer;
          font-size: 10px;
        }

        .profile-button:focus .drop-down,
        .profile-button .drop-down:hover {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0px);
        }

        .profile-button .drop-down .item {
          padding: 10px 20px;
          white-space: nowrap;
          font-size: 12px;
          border: none;
          color: #777;
        }

        .profile-button .tag {
          position: absolute;
          bottom: 40%;
          left: 50%;
          padding: 0px 5px;
          border-radius: 10px;
          border: 2px solid #fff;
          background: orangered;
          font-size: 9px;
          min-width: 20px;
          text-align: center;
          color: #fff;
        }

        @media (max-width: 600px) {
          .home-header {
            margin-bottom: 0px;
          }
          .home-header h4 {
            margin-right: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeHeader;
