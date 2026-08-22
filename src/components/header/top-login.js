import React, { useContext, useState } from 'react'
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import { Context } from '../../context/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import SearchInput from './search-component';

const HeaderLogin = (props) => {
    const { setUser } = props;
    const [, dispatch] = useContext(Context)


    const MyLoginForm = (props) => {

        return (
            <>
                <div className="header-login-links uppercase">
                    <div className="onboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: "7px" }}>

                        {/* <SearchInput onSearch={handleSearch} /> */}

                        {/* Deposit is only relevant once logged in — see profile-menu.js */}

                        <button
                            className="mr-4 top-item uppercase top-login-btn btn red-bg"
                            onClick={() => dispatch({ type: "SET", key: "showloginmodal", payload: true })}
                            style={{ marginRight: '1rem' }}
                        >
                            Login
                        </button>

                        <Link
                            className="top-login-btn btn register-btn-purple top-item"
                            to="/signup"
                            title="Join now"
                            style={{}}
                        >
                            <span className="register-labl uppercase">Register</span>
                        </Link>
                    </div>
                </div>
            </>
        );
    };

    const LoginForm = (props) => {
        return (
            <MyLoginForm />
        );
    }

    return (
        <div className="">
            <ToastContainer />
            <LoginForm />
        </div>
    )
}
export default React.memo(HeaderLogin);
