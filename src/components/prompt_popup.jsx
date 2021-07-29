import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineInfoCircle } from '@meronex/icons/ai';
import React, {Fragment, useEffect} from 'react';

const PromptPopup = ({message, type, onClose = ()=>{}}) => {
    useEffect(() => {
        setTimeout(()=>{
            onClose();
        }, 3000);
    }, []);

    const renderType = ()=>{
        let output = <Fragment></Fragment>
        
        switch (type) {
            case "success":
                output = <div className="anim success">
                    <div className="icon">
                        <AiOutlineCheckCircle size={50} color="#109B0B" />
                    </div>
                </div>
                break;
            case "failure":
                output = <div className="anim failure">
                    <div className="icon">
                        <AiOutlineCloseCircle size={50} color="#CE0A0A" />
                    </div>
                </div>
                break;
            
            default:
                output = <div className="anim default">
                    <div className="icon">
                        <AiOutlineInfoCircle size={50} color="#1F62DF" />
                    </div>
                </div>
                break;
        }

        return output;
    }
    return (
        <div className="prompt">
            <div className="prompt-content">
                {renderType()}
                <p>{message}</p>
            </div>
        </div>
    );
}

export default PromptPopup;
