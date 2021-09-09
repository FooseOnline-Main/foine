import React from 'react';

const InputBox = ({name, icon: Icon, placeholder, type, value="", onChange, inputStyle, ...rest})=>{
    return <div {...rest} className="input-box">
        {Icon && <Icon size={18} color="#222" />}
        <input style={inputStyle} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
        <style jsx>{`
            .input-box{
                padding: 10px;
                background: #efefef;
                border-radius: 10px;
                display: flex;
                align-items: center;
                margin: 0 auto;
                margin-bottom: 15px;
            }

            .input-box input{
                margin-left: 10px;
                padding: 5px 0;
                padding-left: 10px;
                flex: 1;
                margin-right: 10px;
                border: none;
                background: transparent;
                outline: none;
                border-left: 1px solid #dfdfdf;
                font-size: 12px;
            }

            .input-box input::-webkit-input-placeholder{
                font-size: 12px;
            }
        `}</style>
    </div>
}

export default InputBox;