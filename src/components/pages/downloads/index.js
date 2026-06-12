import React, { useCallback, useEffect, useState } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { PdfDocument } from "./Matches";
import makeRequest from "../../utils/fetch-request";
import Select from 'react-select'
import { Card, Tab, Tabs } from "react-bootstrap";
import { formatNumber } from "../../utils/betslip";
import NoEvents from "../../utils/no-events";
import Notify from "../../utils/Notify";

const Header = React.lazy(() => import('../../header/header'));
const SideBar = React.lazy(() => import('../../sidebar/awesome/Sidebar'));
const Footer = React.lazy(() => import('../../footer/footer'));
const Right = React.lazy(() => import('../../right/index'));

export default function MatchesList() {
    const [matches, setMatches] = useState([]);
    const [section, setSection] = useState('highlights');
    const [title, setTitle] = useState('highlights');
    const [eventsOption, setEventsOption] = useState({ value: 100 });
    const [loaded, setLoaded] = useState(false)
    const [jackpotData, setJackpotData] = useState([])
    const [key, setKey] = useState('home');
    const [isJackpot, setIsJackpot] = useState(false);


    const fetchMatches = () => {
        setLoaded(false)
        let method = 'GET'
        let endpoint = "/matches?dooood&page=" + (1) + `&limit=${eventsOption?.value}&tab=` + section + '&sub_type_id=1,10,29,18';
        makeRequest({ url: endpoint, method: method, api_version: 2 }).then(([status, result]) => {
            if (status == 200) {
                setMatches(result)
                if (result.length > 0) {
                    setLoaded(true)
                }
            } else {
                <Notify message={{ status: 400, message: "Could not fetch games. Contact us" }} />
            }
        });
    }

    useEffect(() => {
        fetchMatches();
    }, []);

    const sectionOptions = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'highlights', label: 'Highlights' },
        { value: 'tomorrow', label: 'Tomorrow' }
    ]

    const totalEventOptions = [
        { value: '100', label: '100' },
        { value: '200', label: '200' },
        { value: '300', label: '300' },
        { value: '400', label: '400' },
        { value: '500', label: '500' },
    ]

    const handleEventsChange = e => {
        setEventsOption(e);
        fetchMatches();
    }

    const fetchJackpotData = useCallback(async () => {
        setLoaded(false)
        let match_endpoint = "/matches/jackpot";
        const [match_result] = await Promise.all([
            makeRequest({ url: match_endpoint, method: "get", api_version: 2 })
        ]);
        let [m_status, m_result] = match_result;
        if (m_status == 200) {
            setTitle(m_result?.meta?.name)
            setMatches(m_result?.data || m_result)
            setJackpotData(m_result?.meta)
            if (m_result?.data?.length > 0) {
                setLoaded(true)
            }
        } else {
            <Notify message={{ status: 400, message: "Could not fetch games. Contact us" }} />
        }
    }, []);

    const MatchesPreview = () => {

        return (
            <div className="border border-gray-100">
                <table width={"100%"} className="table table-striped">
                    <tbody className="min-scroll-table-content">
                        <tr className="uppercase">
                            <td>Date/Time</td>
                            <td>Game</td>
                            <td className="text-center">Match</td>
                            <td className="" colSpan={3}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>3 way</td>
                                        </tr>
                                        <tr className="text-sm font-bold">
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr className="capitalize">
                                                            <td>Home</td>
                                                            <td>Draw</td>
                                                            <td>Away</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td colSpan={3}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Double Chance</td>
                                        </tr>
                                        <tr className="text-sm font-bold">
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr className="capitalize">
                                                            <td>1orX</td>
                                                            <td>Xor2</td>
                                                            <td>1or2</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </td>
                            <td colSpan={3}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Over or Under 2.5</td>
                                        </tr>
                                        <tr className="text-sm font-bold">
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr className="capitalize">
                                                            <td>Over</td>
                                                            <td>Under</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>

                        </tr>
                        {matches.map((match, idx) => (
                            <tr>
                                <td className="!p-0 !py-2 text-sm font-bold">{match?.start_time}</td>
                                <td>{match?.game_id}</td>
                                <td className="text-center px-3">{match?.home_team} <span className="font-bold"> VS </span> {match?.away_team}</td>
                                <td className="" colSpan={3}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                {match?.odds?.["1x2"]?.map((odd, idx) => (
                                                    <td>{odd?.odd_value}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>

                                </td>

                                <td colSpan={3}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                {match?.odds?.["Double Chance"]?.map((odd, idx) => (
                                                    <td>{odd?.odd_value}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>

                                </td>
                                <td colSpan={3}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                {match?.odds?.["Total"]?.map((odd, idx) => (
                                                    <td>{odd?.odd_value}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>

                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const fetchActiveTabMatches = async (key) => {
        setKey(key)
        if (key == 'jackpot') {
            fetchJackpotData()
            setIsJackpot(true)
        } else {
            setMatches([])
            setIsJackpot(false)
            setTitle(section)
        }
    }

    const generatePDFDocument = async () => {
        const blob = await pdf(
            <PdfDocument matches={matches} jackpot={isJackpot} title={title} />
        ).toBlob();
        saveAs(blob, "pageName");
    };


    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center'>
                <h4 className="inlin-block">
                    <span className="fa fa-chevron-left"></span>
                    Download Matches
                </h4>
            </div>
            <div className="col-md-12 text-center vh-100">
                <p className="text-2xl my-3 px-2">
                    Grab your favorite games in printable format here. betmundial provides the the best competitie odds for you to take advantage of in all areas of betting
                </p>


                <Tabs
                    variant={'tabs'}
                    defaultActiveKey="matches"
                    onSelect={(k) => fetchActiveTabMatches(k)}
                    className="clear-tabs"
                    justify>
                    <Tab eventKey="matches" title="Matches" className={'background-primary shadow p-5'}
                        style={{}}>

                        {
                            matches?.length > 0 ?
                                <>
                                    <div className="col-md-12 d-flex flex-column p-2">
                                        <div className="row">
                                            <div className="col-md-6 text-start p-2">
                                                <label htmlFor="" className={''}>Select Number of Games</label>
                                                <Select
                                                    options={totalEventOptions}
                                                    value={() => totalEventOptions.filter(obj => obj == eventsOption)}
                                                    onChange={handleEventsChange}
                                                />


                                            </div>
                                            <div className="col-md-6">
                                                <br />
                                                <button
                                                    onClick={generatePDFDocument}
                                                    className={`mt-3 btn login-button text-white btn-lg col-1 ${loaded ? '' : 'disabled'}`}
                                                    style={{ width: "300px", border: "none", padding: "3px", marginLeft: "10px", color: "#fff !important" }}
                                                >

                                                    {loaded ? "Click here to download betmundial matches" : "Loading printable page ... "}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* The matches are here */}

                                    <MatchesPreview />

                                    <div className="md-col-12 text-start py-3 ">
                                        <button
                                            onClick={generatePDFDocument}
                                            className={`btn login-button text-white btn-lg col-1 ${loaded ? '' : 'disabled'}`}
                                            style={{ width: "300px", border: "none", padding: "3px", marginLeft: "10px", color: "#fff !important" }}
                                        >
                                            {loaded ? "Click here to download betmundial matches" : "Loading printable page ... "}
                                        </button>
                                    </div>
                                </> :

                                <NoEvents message={"An Error occurred. Conatct Customer Care on 0143444142"} />
                        }
                    </Tab>
                    <Tab eventKey="jackpot" title="Jackpot" className={'background-primary shadow p-5'}
                        style={{}}>
                    </Tab>
                </Tabs>
            </div>
        </>
    )
}
