import { FaInfoCircle } from '@meronex/icons/fa';
import React, {Fragment} from 'react';
import { useError } from '../providers/errorProvider';

const ErrorPopup = () => {
    const {error} = useError();

    return (
        <div className="error-popup">
            {error ? <div className="bubble">
                <FaInfoCircle size={30} style={{marginRight: 15}} color="#fff" />
                <p>{error}</p>
            </div> : <Fragment></Fragment>}
            <style jsx>{`
                .error-popup{
                    position: fixed;
                    z-index: 100;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .error-popup .bubble{
                    padding: 15px 20px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    background: rgb(255, 80, 80);
                    color: #eee;
                    font-size: 11px;
                    pointer-events: none;
                    animation: pop-in .15s ease-out;
                    -webkit-animation: pop-in .15s ease-out;
                }
                .error-popup .bubble p{
                    white-space: nowrap;
                }
                 @keyframes pop-in{
                    0%{
                        transform: scale(0)
                    }
                    50%{
                        transform: scale(1.2)
                    }
                }
            `}</style>
        </div>
    );
}

export default ErrorPopup;
