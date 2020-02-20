import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import useWinnersDataService from '../Services/useWinnersDataService';
import { IParticipant } from '../types';

const Winners: React.FunctionComponent<{}> = () => {
    const [winners, setWinners] = useWinnersDataService();

    return (
        <div className={'winners'}>
            <div className={'winners__title'}>
                <input className={'winners__title--input'} />
            </div>
            <div className={'winners__wrap'}>
                {Object.keys(winners).map((winnerKey: any) => {
                    const participantData: IParticipant = winners[winnerKey];
                    const body = participantData.content.replace(/(\r\n|\n|\r)/gm, '');

                    return (
                        <div
                            className={classNames(
                                'winners__wrap--container',
                                winners[winnerKey].powerMode && 'power-mode'
                            )}
                            key={winnerKey}
                        >
                            <div className={'winners__wrap--container-bar'}>
                                <div>{winners[winnerKey].name}</div>

                                <div style={{ flex: 1 }} />

                                <div className={'winners__wrap--container-bar-streak'}>
                                    {winners[winnerKey].streak}
                                </div>
                                <div
                                    className={'app__settings--button'}
                                    onClick={() => {
                                        axios.delete(`/winners/${participantData.uuid}`);
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
