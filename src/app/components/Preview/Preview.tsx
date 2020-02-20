import axios from 'axios';
import * as classNames from 'classnames';
import * as React from 'react';
import { Button, Card, Icon } from 'semantic-ui-react';
import { GameStatus, IParticipant } from '../types';

interface IProps {
    gamepin: string;
    html: string;
    participantData: IParticipant;
    tournamentState: GameStatus;
}

const Preview: React.FunctionComponent<IProps> = ({
    gamepin,
    html,
    participantData,
    tournamentState,
}) => {
    const [currentVisible, setCurrentVisble] = React.useState(0);
    const refCurrentVisible = React.useRef(currentVisible);
    refCurrentVisible.current = currentVisible;

    const [firstHtml, setFirstHtml] = React.useState(html);
    const [secondHtml, setSecondHtml] = React.useState(html);

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
        <Card
            className={classNames('previews__preview', participantData.powerMode && 'power-mode')}
            key={participantData.uuid}
        >
            <Card.Content extra={true}>
                <Button.Group floated={'right'}>
                    {tournamentState === GameStatus.FINISHED && (
                        <Vinnerknapper participantData={participantData} />
                    )}

                    <Button
                        icon={true}
                        onClick={() => {
                            if (confirm('Er du sikker på at du vil fjerne deltageren?')) {
                                axios.delete(`/game/${gamepin}/${participantData.uuid}`);
                            }
                        }}
                        labelPosition="right"
                    >
                        Fjern deltager
                        <Icon name="remove" />
                    </Button>
                </Button.Group>

                <Card.Header>{participantData.name}</Card.Header>
            </Card.Content>
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
        </Card>
    );
};

interface IVinnerknappeProps {
    participantData: IParticipant;
}

const Vinnerknapper: React.FunctionComponent<IVinnerknappeProps> = ({
    participantData,
}: IVinnerknappeProps) => {
    if (participantData.winner) {
        return (
            <Button
                color="red"
                icon={true}
                onClick={() => {
                    axios.post(`/toggle-winner`, participantData);
                }}
                labelPosition="right"
            >
                Fjern som vinner
                <Icon name="remove circle" />
            </Button>
        );
    }

    return (
        <Button
            color="green"
            icon={true}
            onClick={() => {
                axios.post(`/toggle-winner`, participantData);
            }}
            labelPosition="right"
        >
            Velg som vinner
            <Icon name="star" />
        </Button>
    );
};

export default Preview;
