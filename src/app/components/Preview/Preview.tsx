import axios from "axios";
import * as classNames from "classnames";
import * as React from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { IKeyPair, IParticipantData } from "../types";

interface IProps {
    html: string;
    numberOfParticipants: number;
    participantData: IParticipantData;
}

const sizes = (numberOfParticipants: number) => {
    if (numberOfParticipants === 1) {
        return {
            height: (innerHeight: number) => innerHeight * 1,
            width: (innerWidth: number) => innerWidth * 1
        };
    } else if (numberOfParticipants <= 4) {
        return {
            height: (innerHeight: number) => innerHeight * 0.5 - 24,
            width: (innerWidth: number) => innerWidth * 0.5 - 24
        };
    } else {
        return {
            height: (innerHeight: number) => innerHeight * 1,
            width: (innerWidth: number) => innerWidth * 1
        };
    }
};

const Preview: React.FunctionComponent<IProps> = ({
    html,
    numberOfParticipants,
    participantData
}) => {
    const [currentVisible, setCurrentVisble] = React.useState(0);
    const refCurrentVisible = React.useRef(currentVisible);
    refCurrentVisible.current = currentVisible;

    const [firstHtml, setFirstHtml] = React.useState(html);
    const [secondHtml, setSecondHtml] = React.useState(html);

    const windowSize = useWindowSize();

    React.useEffect(() => {
        if (currentVisible === 0) {
            setSecondHtml(html);
        } else {
            setFirstHtml(html);
        }

        setTimeout(() => {
            setCurrentVisble((refCurrentVisible.current + 1) % 2);
        }, 500);
    }, [html]);

    return (
        <div
            style={{
                height: `${sizes(numberOfParticipants).height(
                    windowSize.height
                )}px`,
                width: `${sizes(numberOfParticipants).width(
                    windowSize.width
                )}px`
            }}
            className={classNames(
                "previews__preview",
                participantData.powerMode && "power-mode"
            )}
            key={participantData.uuid}
        >
            <div className={"previews__preview--bar"}>
                <div className={"previews__preview--bar-name"}>
                    {participantData.name}
                </div>

                <div style={{ flex: "1" }} />
                <div
                    className={"app__settings--button"}
                    onClick={() => {
                        axios.delete(`/text/${participantData.uuid}`);
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
                        participantData.animate && participantData.streak !== 0
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

            <div className={"previews__preview__iframecontainer"}>
                <iframe
                    className={currentVisible === 0 ? "visible" : "hidden"}
                    srcDoc={firstHtml}
                />
                <iframe
                    className={currentVisible === 1 ? "visible" : "hidden"}
                    srcDoc={secondHtml}
                />
            </div>
        </div>
    );
};

export default Preview;
