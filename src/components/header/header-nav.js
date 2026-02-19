import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../context/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const HeaderNav = () => {
    const [, dispatch] = useContext(Context);
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef(null);

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

    return (
        <div className="d-flex align-items-center">

            {/* Normal Menu */}
            {!searching && (
                <button
                    onClick={showSearchBar}
                    className="btn btn-link text-white p-0 me-3 search-btn"
                >
                    <FontAwesomeIcon size="lg" height={30} icon={faSearch} /> Search
                </button>
            )}

            {/* Search Bar */}
            {searching && (
                <div className="d-flex align-items-center">
                    <input
                        ref={searchInputRef}
                        type="text"
                        onChange={updateSearchTerm}
                        placeholder="Start typing to search..."
                        className="form-control me-2"
                        style={{ maxWidth: "250px" }}
                    />

                    <button
                        className="btn btn-outline-light btn-sm"
                        onClick={dismissSearch}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(HeaderNav);