import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Context } from "../../context/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getFromLocalStorage } from "../utils/local-storage";
import { openLoginWithRedirect } from "../utils/login-redirect";

const HeaderNav = () => {
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const searchInputRef = useRef(null);
    const isCasino = pathname === "/casino" || pathname.startsWith("/casino/");

    const openAffiliate = () => {
        const user = getFromLocalStorage("user") || state?.user;
        if (user) {
            navigate("/affiliate");
            return;
        }
        openLoginWithRedirect(dispatch, "/affiliate");
    };

    const updateSearchTerm = (event) => {
        const value = event.target.value;
        if (value) {
            dispatch({ type: "SET", key: "searchterm", payload: value });
        } else {
            dispatch({ type: "DEL", key: "searchterm" });
        }
    };

    const openSearch = () => {
        setIsOpen(true);
    };

    const closeSearch = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        searchInputRef.current?.focus();
        const onEscape = (event) => {
            if (event.key === "Escape") {
                closeSearch();
            }
        };

        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [isOpen]);

    return (
        <>
            <div className={`header-search-float ${isOpen ? "header-search-float--open" : "header-search-float--closed"}`}>
                {!isOpen ? (
                    <button
                        type="button"
                        className="header-search-float__trigger"
                        onClick={openSearch}
                        aria-label="Open search"
                    >
                        <span className="header-search-float__trigger-icon" aria-hidden="true">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                    </button>
                ) : (
                    <div className="header-search-float__card header-search-float__card--open">
                        <button
                            type="button"
                            className="header-search-float__exit"
                            onClick={closeSearch}
                            aria-label="Close search"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="header-search-float__input-wrap">
                            <span className="header-search-float__icon" aria-hidden="true">
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={state?.searchterm || ""}
                                onChange={updateSearchTerm}
                                placeholder="Search teams, competitions, or game IDs"
                                className="header-search-float__input"
                                aria-label="Search"
                            />
                        </div>
                        <div className="header-search-float__links">
                            <Link
                                to="/"
                                className={`header-search-float__btn ${!isCasino ? "header-search-float__btn--active" : ""}`}
                            >
                                Sports
                            </Link>
                            <Link
                                to="/casino"
                                className={`header-search-float__btn ${isCasino ? "header-search-float__btn--active" : ""}`}
                            >
                                Casino
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            {!isOpen && (
                <button
                    type="button"
                    className="header-affiliate-trigger"
                    onClick={openAffiliate}
                    aria-label="Affiliate"
                    title="Affiliate"
                >
                    <span className="header-affiliate-trigger__icon" aria-hidden="true">
                        <FontAwesomeIcon icon={faHandshake} />
                    </span>
                </button>
            )}
        </>
    );
};

export default React.memo(HeaderNav);
