import { getStatus, useProducts } from "../providers/productProvider";

import { AiOutlineEye } from "@meronex/icons/ai";
import { Link } from "react-router-dom";
import React, { Fragment, useRef } from "react";
import { useAuth } from "../providers/authProvider";
import { useWatchlist } from "../providers/watchlistProvider";
import { useState } from "react";
import { useEffect } from "react";
import Loader from "./simple_loader";
import InputBox from "./input_box";
import { useError } from "../providers/errorProvider";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const MySwal = withReactContent(Swal);

const LiveFeedCard = ({ feed, onExpand, expanded, socket, scroll }) => {
  const checkoutRef = useRef();
  const { user } = useAuth();
  const { increaseWatch, reduceWatch } = useProducts();
  const { error, createError } = useError();
  const {
    isWatching,
    addToWatchlist,
    removeFromWatchlist,
    makePayment,
    verifyOTP,
  } = useWatchlist();
  const [showCheckout, setShowCheckout] = useState(false);
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [orderSuccessfull, setOrderSuccessful] = useState(false);
  const [initOrder, setInitOrder] = useState(false);
  const [payError, setPayError] = useState("");
  const productId = feed.id;

  const handleScrollCheckIntoView = () => {
    checkoutRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const [paymentForm, setPaymentForm] = useState({
    phone: "",
    provider: "mtn",
  });

  useEffect(() => {
    if (expanded) {
      setShowCheckout(true);
    } else {
      setShowCheckout(false);
    }
  }, [expanded]);

  const onViewItem = () => {
    // set current open feed
    document.body.style.overflow = "hidden";
    // onClick();
  };

  const handleAddToWatchlist = () => {
    if (isWatching(feed.id)) {
      reduceWatch(feed);
      removeFromWatchlist(productId);
    } else {
      increaseWatch(feed);
      addToWatchlist(user.uid, productId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (paymentForm.phone === "") {
      createError("Please enter phone number");
      setLoading(false);
      return;
    }
    let stat;

    setInitOrder(true);
    try {
      switch (status) {
        case 1:
          stat = await verifyOTP({ otp, userId: user.uid });
          break;

        default:
          const dat = await makePayment(
            { ...paymentForm, amount: parseFloat(feed.price) * 100 },
            user.uid,
            [
              {
                id: feed.id,
                imageUrl: feed.imageUrl,
                price: feed.price,
                size: feed.size,
                name: feed.name,
              },
            ]
          );
          stat = dat.status;
          socket.emit("newOrder", { userId: socket.id, ref: dat.reference });
          break;
      }

      if (stat) {
        setLoading(false);
        switch (stat) {
          case "send_otp":
            setStatus(1);
            break;

          case "pay_offline":
            setStatus(2);
            break;

          default:
            setStatus(0);
            break;
        }
      }
    } catch (err) {
      console.log(`ERR ${err}`);
      setPayError("Error Processing payment. Please try again later");
      setTimeout(() => {
        setPayError("");
        setShowCheckout(false);
      }, 4000);
    }
  };

  useEffect(() => {
    if (initOrder)
      socket.on("success", () => {
        console.log("WE HAVE CAUGHT THE HOOK");
        setOrderSuccessful(true);
        return () => {
          setOrderSuccessful(false);
          setInitOrder(false);
        };
      });
  }, [initOrder]);

  useEffect(() => {
    const showPop = async () => {
      if (orderSuccessfull) {
        await MySwal.fire({
          title: "Order Successful",
          icon: "success",
          confirmButtonColor: "#222",
        });
      }
    };

    showPop();
  }, [orderSuccessfull]);

  return (
    <div key={feed.key} className="feed-card">
      <Link to={`/preview-product/${feed.id}`}>
        <div
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            margin: "0",
            justifyItems: "center",
            background: "#fff",
            overflow: "visible",
          }}
        >
          <LazyLoadImage
            src={feed.imageUrl}
            effect="blur"
            className="feed-img"
            scrollPosition={scroll}
            alt={feed.name}
          />
        </div>
      </Link>
      <div className="held-stamp">
        {feed.status === 1 ? (
          <img
            src="/images/held-img.png"
            style={{ opacity: 0.9, margin: "0 auto" }}
            width="50%"
            alt={feed.name}
          />
        ) : (
          <Fragment></Fragment>
        )}
      </div>

      {/* feed status */}
      <div
        style={{ background: getStatus(feed.sold ? 2 : feed.status).color }}
        className="status"
      >
        {getStatus(feed.sold ? 2 : feed.status).value}
      </div>

      {/* watch count */}
      {feed.watchCount ? (
        <div className="watch-count">
          <AiOutlineEye size={20} />
          <span style={{ marginLeft: 5 }}>{feed.watchCount}</span>
        </div>
      ) : (
        <Fragment></Fragment>
      )}

      {/* details */}
      <div className="details" onClick={onViewItem}>
        <Link to={`/preview-product/${feed.id}`}>
          {/* <h3>{feed.name}</h3> */}
          <div className="flex">
            <p>Size {feed.size}</p>
            <p style={{ color: "var(--dark-color)" }}>
              <small>GHC</small>
              <span>{parseFloat(feed.price).toFixed(2)}</span>
            </p>
          </div>
        </Link>

        {/* add section */}
        {feed.sold ? (
          <Fragment></Fragment>
        ) : (
          <Fragment>
            <div className={`add-section show`}>
              <Fragment>
                <button
                  className="watch"
                  onClick={() => {
                    const value = !showCheckout;
                    setShowCheckout(value);
                    onExpand();
                    if (!value) {
                      setStatus(0);
                    }
                    handleScrollCheckIntoView();
                    setLoading(false);
                  }}
                >
                  {showCheckout ? "Cancel" : "Buy Now"}
                </button>
                <Fragment>
                  <button
                    style={{ flex: 1 }}
                    className="hold"
                    onClick={handleAddToWatchlist}
                  >
                    {isWatching(feed.id) ? "Remove" : "Buy + more"}
                  </button>
                </Fragment>
              </Fragment>
            </div>

            {/* Phone number field */}
            {status === 0 && (
              <>
                <form
                  ref={checkoutRef}
                  onSubmit={handleSubmit}
                  className={`payment-form ${showCheckout ? "show" : ""}`}
                >
                  <ProviderOptionsSelect
                    value={paymentForm.provider}
                    onSelect={(provider) =>
                      setPaymentForm({ ...paymentForm, provider })
                    }
                  />
                  <InputBox
                    name="phone"
                    placeholder="Enter phone number"
                    value={paymentForm.phone}
                    type="number"
                    style={{ padding: "5px 0", width: "100%" }}
                    onChange={({ target: { value: phone } }) =>
                      setPaymentForm({ ...paymentForm, phone })
                    }
                  />
                  <button disabled={loading} className="watch">
                    {loading ? "Loading..." : "Pay"}
                  </button>
                </form>
                {payError !== "" && <p style={{ color: "red" }}>{payError}</p>}
              </>
            )}

            {/* OTP form field */}
            {status === 1 && (
              <form
                onSubmit={handleSubmit}
                className={`payment-form ${showCheckout ? "show" : ""}`}
              >
                <p style={{ textAlign: "center", marginBottom: 10 }}>
                  Enter the otp code sent to your device below.
                </p>
                <InputBox
                  value={otp}
                  name="otp"
                  type="text"
                  placeholder="Enter OTP here"
                  style={{ padding: "5px 0", width: "100%" }}
                  onChange={({ target: { value } }) => setOtp(value)}
                />
                <button disabled={loading} className="watch">
                  {loading ? "Submitting..." : "Submit OTP"}
                </button>
              </form>
            )}

            {/* Submit Button field */}
            {status === 2 && (
              <form
                onSubmit={handleSubmit}
                className={`payment-form ${showCheckout ? "show" : ""}`}
              >
                <p style={{ textAlign: "center", marginBottom: 10 }}>
                  Finalize payment on your device by entering your PIN.
                </p>
                <Loader />
              </form>
            )}
          </Fragment>
        )}
      </div>
      <style jsx>{`
        .feed-card {
          min-height: 150px;
          break-inside: avoid;
          box-shadow: 0 0 20px 1px #00000015;
          overflow: hidden;
          padding: 0px;
          border-radius: 20px;
          margin-bottom: 15px;
          background: #fff;
          animation: slide-up 0.5s ease-in;
          -webkit-animation: slide-up 0.5s ease-in;
        }

        .feed-card .lock-warning {
          background: #f56a3330;
          color: var(--dark-color);
          border-radius: 10px;
          font-size: 10px;
          padding: 10px;
        }

        @keyframes slide-up {
          0% {
            transform: translateY(10px);
            opacity: 0.5;
          }
        }

        .feed-card .feed-img {
          width: 95%;
          margin-top: 10px;
          object-fit: cover;
          margin-left: 8px;
          border-radius: 20px 20px 20px 20px;
          box-shadow: 0 10px 10px 1px #00000000;
          border: 1px solid #eee;
        }

        .feed-card .held-stamp {
          position: absolute;
          top: 40%;
          left: 0;
          width: 100%;
          display: flex;
          padding-top: 20px;
        }

        .feed-card .watch-count {
          top: 20px;
          left: 20px;
          z-index: 1;
        }

        .feed-card .watch-count span {
          font-size: 13px;
        }

        .feed-card .buttons-toggler {
          display: flex;
          align-items: center;
          column-gap: 5px;
        }
        .feed-card .buttons-toggler hr {
          flex: 1;
          border: none;
          border-top: 1px solid #f5f5f5;
        }

        .feed-card .add-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          column-gap: 5%;
          overflow: hidden;
        }

        .feed-card .add-section.show {
          padding-bottom: 20px;
        }

        .feed-card .payment-form {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding-bottom: 10px;
          overflow: hidden;
        }
        .feed-card .payment-form > * {
          margin-top: -200px;
          transition: 0.25s linear;
        }
        .feed-card .payment-form.show > * {
          margin-top: 0px;
        }

        .feed-card button {
          flex: 1;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 0.7em;
          cursor: pointer;
          background: transparent;
          box-sizing: content-box;
          transition: all 0.15s linear;
          white-space: wrap;
        }
        .feed-card button,
        .feed-card .lock-warning {
          margin-top: 0px;
        }
        .feed-card .add-section.show button,
        .feed-card .add-section.show .lock-warning {
          margin-top: 0px;
        }

        .feed-card button.watch {
          background: var(--dark-colo);
          background: #222;
          color: #fff;
        }
        .feed-card button.hold {
          border: 2px solid #222;
          color: #222;
        }

        .feed-card .details {
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 16px;
          background: #fff;
        }

        @media (max-width: 650px) {
          .feed-card .feed-img {
            max-width: 100%;
            margin: 0px;
            box-shadow: none;
            margin-left: 8px;
          }

          .feed-card .details {
            padding: 10px;
            padding-bottom: 0px;
          }
        }

        .details .flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feed-card h3 {
          font-size: 1.1em;
          color: #222;
        }

        .feed-card p {
          font-size: 0.8em;
          color: #777;
        }

        .feed-card span {
          font-size: 1.3em;
          margin-left: 5px;
          font-family: "gilroyBold";
        }

        @media (max-width: 650px) {
          .feed-card h3 {
            font-size: 0.9em;
          }
          .feed-card button.watch {
            background: #222;
            color: #fff;
            display: block;
          }

          .feed-card p {
            font-size: 0.7em;
          }
        }

        .feed-card .status {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.7em;
          color: #fff;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

const ProviderOptionsSelect = ({ onSelect, value }) => {
  const providers = [
    { name: "MTN", value: "mtn" },
    { name: "Vodafone", value: "vod" },
    { name: "Airtel/Tigo", value: "tgo" },
  ];

  return (
    <div className="provider-select">
      {providers.map((p) => (
        <div
          key={p.value}
          onClick={() => onSelect(p.value)}
          className={`provider ${value === p.value ? "active" : ""}`}
        >
          {p.name}
        </div>
      ))}
      <style jsx>{`
        .provider-select {
          display: flex;
          align-items: center;
          column-gap: 5px;
          justify-content: space-around;
        }

        @media (max-width: 1350px) {
          .provider-select {
            align-items: center;
            column-gap: 5px;
            justify-content: space-around;
          }
        }

        .provider {
          padding: 5px 10px;
          white-space: nowrap;
          font-size: 10px;
          color: #555;
          border: 1px solid #222;
          border-radius: 20px;
          margin-bottom: 10px;
          cursor: pointer;
        }
        .provider.active {
          background: #222;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default LiveFeedCard;
