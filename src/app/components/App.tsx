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
    uuid: string;
}

interface IKeyPair {
    [key: string]: IParticipantData;
}

let setinterval: NodeJS.Timeout;
let participantTimeout: NodeJS.Timeout;

enum tournamentStates {
    NOT_STARTED,
    IN_PROGRESS,
    FINISHED
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
        axios.get("/text").then((response: AxiosResponse<IKeyPair>) => {
            setContents(response.data);
        });
    };

    React.useEffect(() => {
        const tournamentStateLS = localStorage.getItem("tournamentState");
        if (tournamentStateLS) {
            setTournamentState(
                tournamentStates[
                    tournamentStateLS as keyof typeof tournamentStates
                ]
            );
        }

        const countdownLS = localStorage.getItem("countdown");
        if (countdownLS) {
            setCountdown(moment(+countdownLS));
        }

        if (
            tournamentStateLS &&
            tournamentStates[
                tournamentStateLS as keyof typeof tournamentStates
            ] === tournamentStates.IN_PROGRESS
        ) {
            setinterval = setInterval(() => {
                fetchParticipantsData();
            }, 200);

            if (countdownLS) {
                participantTimeout = setTimeout(() => {
                    finishTournament();
                }, moment.duration(moment(+countdownLS).diff(moment()), "milliseconds").asMilliseconds());
            }
        }
    }, []);

    const localStorageSetTournamentState = (
        tournamentStateLS: tournamentStates
    ) => {
        localStorage.setItem(
            "tournamentState",
            tournamentStates[tournamentStateLS]
        );
        setTournamentState(tournamentStateLS);
    };

    const finishTournament = () => {
        clearInterval(participantTimeout);
        clearInterval(setinterval);
        localStorageSetTournamentState(tournamentStates.FINISHED);
    };

    const resetTournament = () => {
        clearInterval(participantTimeout);
        clearInterval(setinterval);
        localStorageSetTournamentState(tournamentStates.NOT_STARTED);

        axios
            .delete("/text")
            .then((response: AxiosResponse) => setContents(response.data));
    };

    const startTournament = () => {
        setinterval = setInterval(() => {
            fetchParticipantsData();
        }, 200);

        localStorageSetTournamentState(tournamentStates.IN_PROGRESS);

        const countdownLS = moment().add(countdownMinutes, "minutes");
        localStorage.setItem(
            "countdown",
            (countdownLS.unix() * 1000).toString()
        );
        setCountdown(countdownLS);

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
                        key={participantData.uuid}
                    >
                        <div className={"app__preview--bar"}>
                            <div className={"app__preview--bar-name"}>
                                {participantData.name}
                            </div>

                            <div style={{ flex: "1" }} />
                            <div
                                className={"app__settings--button"}
                                onClick={() => {
                                    axios
                                        .delete(`/text/${participantData.uuid}`)
                                        .then(response =>
                                            setContents(response.data)
                                        );
                                }}
                            >
                                X
                            </div>
                        </div>

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

                        <iframe srcDoc={body} />
                    </div>
                );
            })}
        </div>
    );
};

export default App;
