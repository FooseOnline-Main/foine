import React from 'react';

const Popup = ({child, onClose}) => {
    return (
        <div className="popup">
            <div onClick={onClose} className="close-bg"></div>
            <div className="inner-wrapper">
                {child}
            </div>
            <style jsx>{`
                .popup{
                    position: fixed;
                    top: 0; left: 0;
                    width: 100vw; 
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }    
                .popup .close-bg{
                    position: absolute;
                    top: 0; left: 0;
                    width: inherit;
                    height: inherit;
                    background: #00000050;
                    backdrop-filter: blur(2px);
                    -webkit-backdrop-filter: blur(2px);
                }
                .popup .inner-wrapper{
                    width: 90%;
                    max-width: 400px;
                    background: #fff;
                    border-radius: 10px;
                    padding: 20px 3%;
                }
            `}</style>
        </div>
    );
}

export default Popup;
