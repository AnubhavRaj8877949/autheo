import { createContext, useContext, useEffect, useState } from "react";

export const MyNodeUrlContext = createContext();

export const NodeUrlProvider = ({ children }) => {
  const [nodeUrl, setNodeUrl] = useState("");
  const [isNodeAdded, setIsNodeAdded] = useState(false);
  const node = localStorage.getItem("node");

  useEffect(() => {
    if (node !== "" && node !== undefined && node) {
      setNodeUrl(node);
      setIsNodeAdded(true);
    }
  }, [node]);

  return (
    <MyNodeUrlContext.Provider
      value={{
        nodeUrl,
        isNodeAdded,
        setIsNodeAdded,
        setNodeUrl,
      }}
    >
      {children}
    </MyNodeUrlContext.Provider>
  );
};
export const useGetNodeUrl = () => useContext(MyNodeUrlContext);
