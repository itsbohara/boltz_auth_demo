import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "./App.css";
import AppLogo from "./logo";

import QRCode from "react-qr-code";
import { useBoltzAuth } from "./authContext";

function App() {
  const authActiveToastId = useRef<any>(null);

  const {
    onAuthInit,
    connectionHash,
    authenticating,
    authorized,
    user,
    logout,
  } = useBoltzAuth();
  const [qrdata, setQRData] = useState<any>(null);

  useEffect(() => {
    onAuthInit();
  }, []);

  useEffect(() => {
    if (authenticating) {
      authActiveToastId.current = toast("Authenticating...", {
        autoClose: 5000,
      });
    }
    if (!authenticating && authorized) {
      toast.update(authActiveToastId.current, {
        render: "Boltz Authorized",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    }
  }, [authenticating]);

  useEffect(() => {
    const _requestedAuth = {
      hash: connectionHash,
      app: "Boltz Auth Demo",
      platform: "Web",
    };
    setQRData(_requestedAuth);
    console.log(connectionHash);
  }, [connectionHash]);

  return (
    <div className="App">
      <AppLogo />

      {!authorized && (
        <div className="card">
          {connectionHash && (
            <>
              <QRCode value={JSON.stringify(qrdata)} style={{ margin: 40 }} />
              <p>Authorize using Boltz Auth app</p>
            </>
          )}

          <button onClick={() => onAuthInit()}>Regenerate Boltz QR</button>
        </div>
      )}

      {authorized && (
        <div className="card">
          <h4>Hello {user.name}</h4>
          <p>UserId : {user.id}</p>
          <p>Email : {user.email}</p>
          <button onClick={() => logout()}>Boltz Logout</button>
        </div>
      )}

      <p className="text-off">Project @Boltz</p>
    </div>
  );
}

export default App;
