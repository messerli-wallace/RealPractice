'use client';

import { useState } from 'react';

// FINISH THIS WHEN STYLING IS INCORPORATED
export default function LikeButton() {
    const[like, setLike] = useState(false);

    function handleLikeClick() {
        if (like == true) {
            console.log('true');
        } 
        else {
            console.log('false');
        }
        setLike(!like);
    }

    const strLike = String(like);

    return <button title='button' type='button' onClick={handleLikeClick}>({strLike})</button>
    
}