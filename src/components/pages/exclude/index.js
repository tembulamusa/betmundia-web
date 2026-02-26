import React, { useContext, useState } from 'react';
import { Context } from '../../../context/store';
import makeRequest from "../../utils/fetch-request";
import Notify from '../../utils/Notify';
import Alert from '../../utils/alert';
import { getFromLocalStorage } from '../../utils/local-storage';
import { useNavigate } from 'react-router-dom';

const Exclude = () => {
    const [state,] = useContext(Context);
    const user = getFromLocalStorage("user") || state?.user;
    const [period, setPeriod] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const handleExclusion = () => {
        if (!period) {
            setMessage({ status: 400, message: "Please select an exclusion period" });
            return;
        }

        const endpoint = "/user/self-exclude"; // 🔁 change to your real endpoint
        const payload = {
            msisdn: user?.msisdn,
            period: period
        };

        setIsLoading(true);

        makeRequest({
            url: endpoint,
            method: "POST",
            data: payload,
            api_version: 2
        }).then(([status, response]) => {

            if ([200, 201].includes(status)) {
                if (response?.status === 200) {
                    Notify({
                        status: 200,
                        message: "Self exclusion activated successfully"
                    });
                    setMessage(null);
                    setTimeout(() => {
                        navigate("/logout"); // Redirect to homepage or any other page after successful exclusion
                    }, 3000);
                } else {
                    setMessage({
                        status: 400,
                        message: response?.message || "Unable to activate exclusion"
                    });
                }
            } else {
                setMessage({
                    status: status,
                    message: response?.error?.message || "Something went wrong"
                });
            }

            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
            setMessage({
                status: 500,
                message: "Server error. Please try again."
            });
        });
    };

    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block">Self exclusion</h4>
            </div>

            <div className='std-medium-width-block'>
                <div className="col-md-12 py-5 px-4">

                    {message && <Alert message={message} />}

                    <p>
                        This self-exclusion page provides you with the option to take a break from
                        gambling activities for a specific period of time.
                    </p>

                    <div className="flex flex-col items-center gap-5 mt-12">

                        <div className="form-group">
                            <label>Your phone number:</label>
                            <span className="phone-number font-bold ml-2">
                                {user?.msisdn}
                            </span>
                        </div>

                        <div className="form-group text-center mt-5 w-full">
                            <label className="block mb-2 text-xl">
                                Select period of exclusion:
                            </label>

                            <select
                                className="custom-select w-full p-2 text-xl"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            >
                                <option value="">Select a period</option>
                                <option value="1">1 month</option>
                                <option value="3">3 months</option>
                                <option value="6">6 months</option>
                                <option value="12">1 year</option>
                                <option value="-1">Indefinitely</option>
                            </select>
                        </div>

                        <button
                            onClick={handleExclusion}
                            disabled={isLoading}
                            className="my-3 w-full block capitalize secondary-bg bg-custom-red p-3 font-bold border-none text-white uppercase hover:opacity-80 rounded-2xl h-20"
                        >
                            {isLoading ? "Processing..." : "Exclude me from betting"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Exclude;