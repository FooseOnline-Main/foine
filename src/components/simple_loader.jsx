import React from 'react';

const Loader = ({expand = false}) => {
    return (
        <div className={`loader-box ${expand ? 'expand' : ''}`}><div className="loader"></div></div>
    );
}

export default Loader;
