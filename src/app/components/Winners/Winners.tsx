import axios from "axios";
import * as React from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { sizes } from "../Preview/Preview";
import useWinnersDataService from "../Services/useWinnersDataService";
import { IParticipantData } from "../types";

const Winners: React.FunctionComponent<{}> = () => {
    const [winners, setWinners] = useWinnersDataService();
    const windowSize = useWindowSize();

    return (
        <div className={"winners"}>
            <div className={"winners__title"}>
                <input className={"winners__title--input"} />
            </div>
            <div className={"winners__wrap"}>
                {Object.keys(winners).map((winnerKey: any) => {
                    const participantData: IParticipantData =
                        winners[winnerKey];
                    const body = participantData.content.replace(
                        /(\r\n|\n|\r)/gm,
                        ""
                    );

                    return (
                        <div
                            style={{
                                height: `${sizes(4).height(windowSize.height)}`,
                                width: `${sizes(4).width(windowSize.width)}`
                            }}
                            className={"winners__wrap--container"}
                            key={winnerKey}
                        >
                            <div className={"winners__wrap--container-bar"}>
                                <div>{winners[winnerKey].name}</div>

                                <div style={{ flex: 1 }} />

                                <div
                                    className={"app__settings--button"}
                                    onClick={() => {
                                        axios.delete(
                                            `/winners/${participantData.uuid}`
                                        );
                                    }}
                                >
                                    X
                                </div>
                            </div>

                            <iframe srcDoc={body} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Winners;
