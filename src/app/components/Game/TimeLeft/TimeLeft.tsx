import * as moment from 'moment';
import * as React from 'react';

interface IProps {
    endTime: string | undefined;
}

const TimeLeft: React.StatelessComponent<IProps> = ({ endTime }) => {
    if (!endTime) {
        return <></>;
    }

    const [timeLeft, setTimeLeft] = React.useState(0);

    React.useEffect(() => {
        setInterval(() => {
            const duration = moment.duration(moment(endTime).diff(moment())).asMilliseconds();
            setTimeLeft(duration < 0 ? 0 : duration);
        }, 1000);
    }, [endTime]);

    return (
        <div className={'game__countdown'}>{`Gjenstår ${moment
            .utc(timeLeft)
            .format('mm:ss')}`}</div>
    );
};

export default TimeLeft;
