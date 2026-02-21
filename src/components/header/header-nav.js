import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../../context/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const HeaderNav = () => {
    const [, dispatch] = useContext(Context);
    const { pathname } = useLocation();
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef(null);
    const isCasino = pathname === "/casino" || pathname.startsWith("/casino/");

    const updateSearchTerm = (event) => {
        const value = event.target.value;
        if (value.length >= 3) {
            dispatch({ type: "SET", key: "searchterm", payload: value });
        } else {
            dispatch({ type: "DEL", key: "searchterm" });
        }
    };

    const showSearchBar = () => {
        setSearching(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const dismissSearch = () => {
        setSearching(false);
        dispatch({ type: "DEL", key: "searchterm" });
    };

    useEffect(() => {
        if (!searching) return;
        const onEscape = (e) => {
            if (e.key === "Escape") dismissSearch();
        };
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [searching]);

    return (
        <div className="d-flex align-items-center">
            {!searching && (
                <button
                    onClick={showSearchBar}
                    className="btn btn-link text-white p-0 me-3 search-btn"
                >
                    <FontAwesomeIcon size="lg" height={30} icon={faSearch} />
                    <span className="search-btn__label"> Search</span>
                </button>
            )}

            {searching && (
                <div
                    className="header-search-overlay"
                    role="dialog"
                    aria-label="Search"
                >
                    <div className="header-search-overlay__inner">
                        <div className="header-search-overlay__input-wrap">
                            <input
                                ref={searchInputRef}
                                type="text"
                                onChange={updateSearchTerm}
                                placeholder="Start typing to search..."
                                className="header-search-overlay__input"
                            />
                            <button
                                type="button"
                                className="header-search-overlay__close"
                                onClick={dismissSearch}
                                aria-label="Close search"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="header-search-overlay__links">
                            <Link
                                to="/"
                                className={`header-search-overlay__btn ${!isCasino ? "header-search-overlay__btn--active" : ""}`}
                            >
                                Sports
                            </Link>
                            <Link
                                to="/casino"
                                className={`header-search-overlay__btn ${isCasino ? "header-search-overlay__btn--active" : ""}`}
                            >
                                Casino
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HeaderNav);