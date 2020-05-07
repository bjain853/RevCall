import React from 'react'
import { Link } from 'react-router-dom'
import SignedInLinks from './SingedInLinks'
import SignedOutLinks from './SignedOutLinks'

const color='red darken-3';

const Navbar = () => {
    return (
        <nav className={"nav-wrapper"+color}>
            <div className="container">
                <div className="left">
                    <Link to='/' className='brand-logo left'>RevCall</Link>
                </div>
                <SignedInLinks/>
                <SignedOutLinks/>
            </div>
        </nav>  
    );
}

export default Navbar;