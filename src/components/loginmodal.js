import React, { useContext, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Context } from "../context/store"
import "../App.css";
import BodyLogin from './header/mobile-login';
import { useLocation } from "react-router-dom";
import {
    dismissLoginModalIfSessionPresent,
    isHomeNavigationPath,
} from "./utils/login-redirect";



const LoginModal = (props) => {
    const { setUser } = props;

    const [state, dispatch] = useContext(Context);
    const location = useLocation();

    // Home / logo navigation should close the modal when a session is still
    // recoverable in localStorage (do not force logout just to leave the popup).
    useEffect(() => {
        if (state?.showloginmodal !== true) {
            return;
        }
        if (!isHomeNavigationPath(location.pathname)) {
            return;
        }
        dismissLoginModalIfSessionPresent(dispatch);
    }, [location.pathname, location.search, location.hash, state?.showloginmodal, dispatch]);

    return (
        <>
            <Modal
                animation={false}
                show={state?.showloginmodal == true}
                onHide={() => dispatch({ type: "SET", key: "showloginmodal", payload: false })}
                dialog className="popover-login-modal"
                aria-labelledby="contained-modal-title-vcenter">
                <Modal.Header closeButton className="no-header">
                    <Modal.Title className="uppercase">Login To BetMundial</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <BodyLogin setUser={setUser} />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default LoginModal;
