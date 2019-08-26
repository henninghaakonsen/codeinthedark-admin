import axios, { AxiosResponse } from "axios";
import * as classNames from "classnames";
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

const App: React.StatelessComponent = () => {
    const [contents, setContents] = React.useState<IKeyPair>({});

    const fetchParticipantsData = () => {
        axios.get("/text").then((response: AxiosResponse) => {
            setContents(response.data);
        });
    };
    React.useEffect(() => {
        fetchParticipantsData();

        const setinterval = setInterval(() => {
            fetchParticipantsData();
        }, 200);

        return () => clearInterval(setinterval);
    }, []);

    return (
        <div className={"app"}>
            <div
                className={"app__reset"}
                onClick={() =>
                    axios
                        .delete("/text")
                        .then((response: AxiosResponse) =>
                            setContents(response.data)
                        )
                }
                children={"Reset"}
            />
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
