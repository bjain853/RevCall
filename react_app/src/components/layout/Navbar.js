import React from 'react'
import { Link } from 'react-router-dom'
import SignedInLinks from './SingedInLinks'
import SignedOutLinks from './SignedOutLinks'

const Navbar = () => {
    return (
        <nav className="nav-wrapper red darken-3">
            <div className="container">
                <div className="left">
                    <Link to='/' className='brand-logo'>RevCall</Link>
                </div>
                <SignedInLinks/>
                <SignedOutLinks/>
            </div>
        </nav>  
    );
}

export default Navbar;