import React, { useState } from "react";

const Alert = (props) => {
    const { message } = props;
    const [messagev, setMessage] = useState(message);
    let c = [200, 201].includes(messagev?.status) ? 'success' : 'danger';
    let x_style = {
        float: "right",
        display: "block",
        fontSize: "22px",
        color: "white",
        cursor: "pointer",
        padding: "3px"
    }
    return (<>{message?.status &&
        <div role="alert"
            className={`fade alert alert-${c} show alert-dismissible`}>
            {message?.message}
            <span aria-hidden="true" style={x_style} onClick={() => setMessage(null)}>&times;</span>
        </div>}
    </>);

};
export default React.memo(Alert);