import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../context/store';

const BodyLogin = React.lazy(() => import('../header/mobile-login'));

const Login = (props) => {
    const [state, dispatch] = useContext(Context);
    const [user, setUser] = useState(null);

    useEffect(() => {
        dispatch({ type: "SET", key: "fullpagewidth", payload: true });
        return () => {
            dispatch({ type: "DEL", key: "fullpagewidth" });
        };
    }, []);

    useEffect(() => {
        if (user) {
            window.location.href = "/";
        }

    }, [user]);


    return (
        <div className="" style={{ background: '#0f0f1f', minHeight: '100vh', color: '#ffffff' }}>
            <div className='signup-container' style={{ paddingTop: '20px' }}>
                <div className='std-medium-width-block'>
                    <div className="col-md-12 mt-2 p-2 std-boxed-form-page"
                        style={{}}
                    >
                        <div className='text-center mb-4'>
                            <h4 className="" style={{ color: '#ffffff', fontSize: '28px', fontWeight: '600' }}>
                                Login
                            </h4>
                        </div>
                        <BodyLogin setUser={setUser} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;