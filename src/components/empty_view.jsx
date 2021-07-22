import React, {Fragment} from 'react';

const EmptyView = ({message, icon, useIcon = true}) => {
    return (
        <div className="empty-box">
            {useIcon ? icon : <Fragment></Fragment>}
            <p style={{marginTop: useIcon ? 20 : 0}}>{message}</p>
            <style jsx>{`
                .empty-box{
                    padding: 0 20%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    right: 0; 
                    bottom: 0; 
                    top: 0;
                }

                .empty-box p{
                    font-size: 14px;
                    color: #999;
                }
            `}</style>
        </div>
    );
}

export default EmptyView;
