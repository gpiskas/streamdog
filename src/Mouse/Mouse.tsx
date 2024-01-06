import React from 'react';
import "./Mouse.css";

interface MouseProps {
    displaySize: number[]
}

function Mouse(props: MouseProps) {
    return (
        <div className='mousepad'>
            <div className='mouse'>{props.displaySize[0]}</div>
        </div>
    );
}

export default Mouse;

