
import React from 'react'

export default function StartBtn(props) {

    const initialAction = () => {
        props.actions.initialAction();
    }

    return (
        <div>
            <button className='start-btn font-bold' onClick={()=> initialAction()}>Start Now</button>
        </div >
    )
}