import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../context/store';

const BodyLogin = React.lazy(() => import('../header/mobile-login'));

const Login = (props) => {
    const [, dispatch] = useContext(Context);
    const [user, setUser] = useState(null);

    useEffect(() => {
        dispatch({ type: "SET", key: "fullpagewidth", payload: true });
        return () => {
            dispatch({ type: "DEL", key: "fullpagewidth" });
        };
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            window.location.href = "/";
        }

    }, [user]);


    return (
        <div className='signup-container' style={{ paddingTop: '20px' }}>
            <div className='std-medium-width-block'>
                <div className="col-md-12 mt-2 p-2 std-boxed-form-page">
                    <div className='text-center mb-4'>
                        <h4 className="" style={{ color: '#ffffff', fontSize: '28px', fontWeight: '600' }}>
                            Login
                        </h4>
                    </div>
                    <BodyLogin setUser={setUser} />
                </div>
            </div>
        </div>
    );
}

export default Login;
