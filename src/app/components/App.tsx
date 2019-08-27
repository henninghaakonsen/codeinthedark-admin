import axios, { AxiosResponse } from "axios";
import * as classNames from "classnames";
import * as moment from "moment";
import "moment-duration-format";
import * as React from "react";

interface IParticipantData {
    animate: boolean;
    animationKey: number;
    content: string;
    exclamation: string;
    name: string;
    powerMode: boolean;
    streak: number;
}

interface IKeyPair {
    [key: string]: IParticipantData;
}

let setinterval: NodeJS.Timeout;
let participantTimeout: NodeJS.Timeout;

enum tournamentStates {
    "NOT_STARTED",
    "IN_PROGRESS",
    "FINISHED"
}

const App: React.StatelessComponent = () => {
    const [countdownMinutes, setCountdownMinutes] = React.useState(15);
    const [tournamentState, setTournamentState] = React.useState<
        tournamentStates
    >(tournamentStates.NOT_STARTED);

    const [countdown, setCountdown] = React.useState<
        moment.Moment | undefined
    >();

    const [contents, setContents] = React.useState<IKeyPair>({});

    const fetchParticipantsData = () => {
        axios.get("/text").then((response: AxiosResponse) => {
            setContents(response.data);
        });
    };

    const finishTournament = () => {
        clearInterval(participantTimeout);
        clearInterval(setinterval);
        setTournamentState(tournamentStates.FINISHED);
    };

    const resetTournament = () => {
        clearInterval(participantTimeout);
        clearInterval(setinterval);
        setTournamentState(tournamentStates.NOT_STARTED);

        axios
            .delete("/text")
            .then((response: AxiosResponse) => setContents(response.data));
    };

    const startTournament = () => {
        setinterval = setInterval(() => {
            fetchParticipantsData();
        }, 200);

        setTournamentState(tournamentStates.IN_PROGRESS);

        setCountdown(moment().add(countdownMinutes, "minutes"));

        participantTimeout = setTimeout(() => {
            finishTournament();
        }, countdownMinutes * 60000);
    };

    return (
        <div className={"app"}>
            <div className={"app__settings"}>
                {tournamentState === tournamentStates.IN_PROGRESS &&
                    countdown &&
                    countdown.isAfter(moment()) && (
                        <div className={"app__settings--countdown"}>
                            {moment
                                .duration(
                                    countdown.diff(moment()),
                                    "milliseconds"
                                )
                                .format("mm:ss")}
                        </div>
                    )}

                {tournamentState === tournamentStates.NOT_STARTED && (
                    <>
                        <div
                            className={"app__settings--button"}
                            onClick={() => {
                                fetchParticipantsData();
                            }}
                            children={"Fetch"}
                        />
                        <div
                            className={"app__settings--button"}
                            onClick={() => {
                                startTournament();
                            }}
                            children={"Start"}
                        />

                        <div className={"app__settings--divider"} />

                        <select
                            className={"app__settings--select"}
                            onChange={(
                                event: React.ChangeEvent<HTMLSelectElement>
                            ) =>
                                setCountdownMinutes(
                                    parseInt(event.target.value, 10)
                                )
                            }
                            value={countdownMinutes}
                        >
                            <option value={10}>10 minute countdown</option>
                            <option value={15}>15 minute countdown</option>
                            <option value={20}>20 minute countdown</option>
                        </select>
                    </>
                )}

                {tournamentState === tournamentStates.IN_PROGRESS && (
                    <div
                        className={"app__settings--button"}
                        onClick={() => {
                            resetTournament();
                        }}
                        children={"Reset"}
                    />
                )}

                {tournamentState === tournamentStates.FINISHED && (
                    <>
                        <div className={"app__settings--stop"}>STOP!</div>
                        <div
                            className={"app__settings--button"}
                            onClick={() => {
                                resetTournament();
                            }}
                            children={"Reset"}
                        />
                    </>
                )}
            </div>

            {Object.keys(contents).map((contentKey: any) => {
                const participantData: IParticipantData = contents[contentKey];
                const body = participantData.content.replace(
                    /(\r\n|\n|\r)/gm,
                    ""
                );

                return (
                    <div
                        className={classNames(
                            "app__preview",
                            participantData.powerMode && "power-mode"
                        )}
                        key={participantData.name}
                    >
                        <h5 className={"app__preview-name"}>
                            {participantData.name}
                        </h5>
                        <div className="streak-container">
                            <div className="current">Combo</div>
                            <div
                                key={participantData.animationKey}
                                className="counter bump"
                            >
                                {participantData.streak}
                            </div>
                            <div
                                key={participantData.animationKey + 1}
                                className={`bar ${
                                    participantData.animate &&
                                    participantData.streak !== 0
                                        ? "animate"
                                        : ""
                                }`}
                            />
                            <div className="exclamations">
                                {participantData.exclamation && (
                                    <span
                                        key={participantData.exclamation}
                                        className="exclamation"
                                    >
                                        {participantData.exclamation}
                                    </span>
                                )}
                            </div>
                        </div>
                        <iframe
                            className={"app__preview-iframe"}
                            srcDoc={`
                            <html style="height: 100%; width: 100%; margin: 0">
                                <body style="height: 100%; width: 100%; margin: 0">
                                   ${body}
                                </body>
                            </html>`}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default App;
