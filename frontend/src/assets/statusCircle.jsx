import React from "react";

/**
 * StatusCircle renders a small colored dot whose hue varies along a gradient
 * from red (low) to green (high).  The caller may pass either `percent` (0-100)
 * or a discrete `level` (0..5) – percent will be normalized internally.  This
 * component is used both in the legend/key and elsewhere where a colour
 * indicator is desirable.
 */
const statusCircle = ({ percent = 0, level }) => {
    // if level provided, convert to percent over six steps
    let pct = percent;
    if (typeof level === 'number') {
        const clampedLevel = Math.max(0, Math.min(5, level));
        pct = (clampedLevel / 5) * 100;
    }

    pct = Math.max(0, Math.min(100, pct));

    // map 0 -> red (0°) to 100 -> green (120°) in HSL space
    const hue = (pct / 100) * 120;
    const circleStyle = {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: `hsl(${hue}, 70%, 50%)`,
        border: '1px solid #ccc',
        transition: 'background-color 0.3s ease'
    };

    return <div style={circleStyle} title={`${Math.round(pct)}% Full`} />;
};

export default statusCircle;  