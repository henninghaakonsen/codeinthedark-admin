import * as React from "react";

const useWindowSize = () => {
    const getSize = () => {
        return {
            height: window.innerHeight - 50,
            width: window.innerWidth - 16
        };
    };

    const [windowSize, setWindowSize] = React.useState(getSize);

    React.useEffect(() => {
        const handleResize = () => {
            setWindowSize(getSize());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

export default useWindowSize;
