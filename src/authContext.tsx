import PropTypes from "prop-types";
import { createContext, useState, useEffect, useContext } from "react";

import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

// ----------------------------------------------------------------------
type Array = any[];

const anyType: any = undefined;

const _participants: Array = [];

type State = {
  onAuthInit: Function;
  logout: Function;
  connectionHash: string | null;
  user: any;
  authenticating: boolean;
  authorized: boolean;
};

const initialState: State = {
  authenticating: true,
  onAuthInit: () => {},
  logout: () => {},
  connectionHash: null,
  user: null,
  authorized: false,
};

const BoltzAuthContext = createContext(initialState);

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

const socket = io(
  //   "http://localhost:7766/"
  "http://192.168.0.108:7766"
  // {   extraHeaders: {
  //     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //   },}
);
// ----------------------------------------------------------------------

function BoltzAuthProvider({ children }) {
  const [fetching, setFetching] = useState(true);

  // user
  const [authenticating, setAuthenticating] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<any>(undefined);

  //socket
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionHash, setConnectionHash] = useState<any>(null);
  const [lastPong, setLastPong] = useState<any>(null);

  useEffect(() => {
    if (userToken) fetchCurrentUser();
  }, [userToken]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:7766/api/account/me", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUser(res.data?.currentUser);
      setAuthorized(true);
      setAuthenticating(false);
      socket.emit("boltz@auth:authorized", connectionHash);
    } catch (error) {
      setAuthorized(true);
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    if (!isConnected) return;

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
      toast("Auth Socket Connected!");
    });

    // isConnected &&
    socket.on("boltz@auth:init", (conn) => setConnectionHash(conn));
    // on receving login
    socket.on("boltz@auth:initialize", () => setAuthenticating(true));
    socket.on("boltz@auth:login", (_token) => setUserToken(_token));

    socket.on("_cs_success", (text) => {});
    socket.on("_cs_error", (error) => {
      toast.error(error);
    });

    return () => {
      socket.off("connect");
      socket.off("boltz@auth:init");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, [isConnected]);

  const handleAuthRequest = () => socket.emit("boltz@auth:request");
  const fetchAuthUser = async () => {
    // const { data: chatUser } = await axios.get(`/user/${kuradiUserID}`);
    // setFetching(false);
  };

  const handleLogout = () => {
    setConnectionHash(null);
    setUserToken(undefined);
    setAuthorized(false);
    setUser(null);
  };

  return (
    <BoltzAuthContext.Provider
      value={{
        authenticating,
        onAuthInit: handleAuthRequest,
        connectionHash,
        logout: handleLogout,
        user,
        authorized,
      }}
    >
      {children}
    </BoltzAuthContext.Provider>
  );
}

const useBoltzAuth = () => useContext(BoltzAuthContext);

export { BoltzAuthProvider, BoltzAuthContext, useBoltzAuth };
