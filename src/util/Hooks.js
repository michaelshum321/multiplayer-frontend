import React from "react";

const usePrevious = (val) => {
  const ref = React.useRef();

  React.useEffect(() => {
    ref.current = val;
  }, [val]);

  return ref.current;
};

export { usePrevious };
