import React from "react";

const statusCircle = ({percent}) => {
    const g = Math.floor(255*(1 - percent/100));
    const b = Math.floor(255*(1 - percent/100));

    const circleStyle = {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'rgb(255, ${g}, ${b})',
        border: '1px',
        transition: 'background-color 0.3 ease'
    };

    return <div style={circleStyle} title={'${percent}% Full'} />;
};

export default statusCircle;  