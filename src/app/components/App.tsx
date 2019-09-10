import axios, { AxiosResponse } from "axios";
import * as moment from "moment";
import "moment-duration-format";
import * as React from "react";
import Preview from "./Preview/Preview";
import { IParticipantData } from "./types";
import useDataService from "./useDataService";

enum tournamentStates {
    NOT_STARTED,
    IN_PROGRESS,
    FINISHED
}

let timerTimeout: NodeJS.Timeout;
let participantTimeout: NodeJS.Timeout;

const App: React.StatelessComponent = () => {
    const [contents, setContents] = useDataService();

    const [countdownMinutes, setCountdownMinutes] = React.useState(15);
    const [tournamentState, setTournamentState] = React.useState<
        tournamentStates
    >(tournamentStates.NOT_STARTED);

    const [countdown, setCountdown] = React.useState<number>(0);
    const refCountdown = React.useRef(countdown);
    refCountdown.current = countdown;

    const setupTimerTimeout = () => {
        timerTimeout = setInterval(() => {
            setCountdown(refCountdown.current - 1);
            localStorage.setItem(
                "countdown",
                (refCountdown.current - 1).toString()
            );
        }, 1000);
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
            setCountdown(parseInt(countdownLS, 10));
        }

        if (
            tournamentStateLS &&
            tournamentStates[
                tournamentStateLS as keyof typeof tournamentStates
            ] === tournamentStates.IN_PROGRESS
        ) {
            if (countdownLS) {
                participantTimeout = setTimeout(() => {
                    finishTournament();
                }, moment.duration(+countdownLS, "seconds").asMilliseconds());

                setupTimerTimeout();
            }
        }

        return () => {
            clearTimeout(timerTimeout);
            clearTimeout(participantTimeout);
        };
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
        localStorageSetTournamentState(tournamentStates.FINISHED);
    };

    const resetTournament = () => {
        clearInterval(participantTimeout);
        localStorageSetTournamentState(tournamentStates.NOT_STARTED);

        axios
            .delete("/text")
            .then((response: AxiosResponse) => setContents(response.data));
    };

    const startTournament = () => {
        localStorageSetTournamentState(tournamentStates.IN_PROGRESS);

        const countdownLS = countdownMinutes * 60;
        localStorage.setItem("countdown", countdownLS.toString());
        setCountdown(countdownLS);

        participantTimeout = setTimeout(() => {
            finishTournament();
        }, countdownMinutes * 60000);

        setupTimerTimeout();
    };

    return (
        <div className={"app"}>
            <div className={"app__settings"}>
                <div className={"app__settings--tittel"}>Code in the Dark</div>
                <div style={{ flex: 1 }} />
                {tournamentState === tournamentStates.IN_PROGRESS &&
                    countdown !== 0 && (
                        <div className={"app__settings--countdown"}>
                            {moment
                                .duration(countdown, "seconds")
                                .format("mm:ss")}
                        </div>
                    )}

                {tournamentState === tournamentStates.NOT_STARTED && (
                    <>
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
            <div className={"previews"}>
                {Object.keys(contents).map((contentKey: any) => {
                    const participantData: IParticipantData =
                        contents[contentKey];
                    const body = participantData.content.replace(
                        /(\r\n|\n|\r)/gm,
                        ""
                    );

                    return (
                        <Preview
                            key={contentKey}
                            html={body}
                            participantData={participantData}
                            numberOfParticipants={
                                Object.values(contents).length
                            }
                            setContents={setContents}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default App;
