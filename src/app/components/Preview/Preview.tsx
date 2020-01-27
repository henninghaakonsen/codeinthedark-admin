import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { GameStatus, IParticipant } from '../types';

interface IProps {
    html: string;
    numberOfParticipants: number;
    participantData: IParticipant;
    tournamentState: GameStatus;
}

export const sizes = (numberOfParticipants: number) => {
    if (numberOfParticipants === 1) {
        return {
            height: (innerHeight: number) => `${innerHeight * 1 - 8}px`,
            width: (innerWidth: number) => `${innerWidth * 1 - 24}px`,
        };
    } else if (numberOfParticipants <= 4) {
        return {
            height: (innerHeight: number) => `${innerHeight * 0.5 - 8}px`,
            width: (innerWidth: number) => `${innerWidth * 0.5 - 24}px`,
        };
    } else {
        return {
            height: (innerHeight: number) => `100%`,
            width: (innerWidth: number) => `100%`,
        };
    }
};

const Preview: React.FunctionComponent<IProps> = ({
    html,
    numberOfParticipants,
    participantData,
    tournamentState,
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
        }, 250);
    }, [html]);

    return (
        <div
            style={{
                height: `${sizes(numberOfParticipants).height(windowSize.height)}`,
                width: `${sizes(numberOfParticipants).width(windowSize.width)}`,
            }}
            className={classNames('previews__preview', participantData.powerMode && 'power-mode')}
            key={participantData.uuid}
        >
            <div className={'previews__preview--bar'}>
                <div className={'previews__preview--bar-name'}>{participantData.name}</div>
                <div style={{ flex: '1' }} />

                {tournamentState === GameStatus.FINISHED && (
                    <div
                        className={'app__settings--button'}
                        onClick={() => {
                            axios.post(`/new-winner`, participantData);
                        }}
                    >
                        WINNER
                    </div>
                )}
                <div
                    className={'app__settings--button'}
                    onClick={() => {
                        axios.delete(`/participant-data/${participantData.uuid}`);
                    }}
                >
                    X
                </div>
            </div>

            <div className={'previews__preview__iframecontainer'}>
                <iframe
                    className={currentVisible === 0 ? 'visible' : 'hidden'}
                    srcDoc={firstHtml}
                />
                <iframe
                    className={currentVisible === 1 ? 'visible' : 'hidden'}
                    srcDoc={secondHtml}
                />
            </div>
        </div>
    );
};

export default Preview;
