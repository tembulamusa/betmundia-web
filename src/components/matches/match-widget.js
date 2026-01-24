import React, { useEffect } from "react";
import '../../assets/css/theme.css';



const MatchWidget = (props) => {
    const { parentMatchId } = props;

    const loadWidget = (parentMatchId) => {
        if (!window.SIR) {
            const script = document.createElement("script");
            script.src = "https://widgets.sir.sportradar.com/d9d6a9c373db18dfdf63352e1c1d9321/widgetloader";
            script.async = true;
            script.setAttribute("n", "SIR");
            script.onload = () => {
                window.SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {
                    streamToggle: "onPitchButton",
                    layout: "double",
                    detailedScoreboard: "disable",
                    tabsPosition: "top",
                    matchId: parentMatchId,
                });
            };
            document.body.appendChild(script);
        } else {
            window.SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {
                streamToggle: "onPitchButton",
                layout: "double",
                detailedScoreboard: "disable",
                tabsPosition: "top",
                matchId: parentMatchId,
            });
        }
    };

    useEffect(() => {
        if (parentMatchId) {
            loadWidget(parentMatchId);
        }
    }, [parentMatchId]);

    return (
        <div class="widgets">
            <div>
                <div class="sr-widget sr-widget-1"></div>
            </div>
        </div>
    );
};

export default MatchWidget;