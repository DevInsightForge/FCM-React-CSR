import axios from "axios";
import { useEffect, useState } from "react";
import {
  getFirebaseToken,
  registerOnMessageCallback,
  removeFirebaseServiceWorker,
} from "./utilities/firebase";

const notificationServer = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_SERVER,
});

const PushNotification = () => {
  const [shouldGetToken, setShouldGetToken] = useState(false);
  const [shouldGetNotification, setShouldGetNotification] = useState(false);
  const [pushNotifications, setPushNotifications] = useState([]);

  console.log({ shouldGetNotification, shouldGetToken });

  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      console.log("Permission result: ", permission);
      if (permission === "granted") {
        setShouldGetToken(true);
      }
    });
  }, []);

  useEffect(() => {
    if (shouldGetToken) {
      getFirebaseToken()
        .then((firebaseToken) => {
          console.log("Firebase token: ", firebaseToken);
          if (firebaseToken) {
            notificationServer
              .post("/api/PushNotification/Sync", {
                userId: 1,
                deviceId: firebaseToken,
              })
              .then(() => {
                setShouldGetNotification(true);
              });
          }
        })
        .catch((err) =>
          console.error(
            "An error occured while retrieving firebase token. ",
            err
          )
        );
    }
  }, [shouldGetToken]);

  useEffect(() => {
    if (shouldGetNotification) {
      console.log("Listening for notification");
      registerOnMessageCallback((payload) => {
        console.log("Received foreground message: ", payload);
        setPushNotifications((prev = []) => [payload, ...prev]);
      });
    }
  }, [shouldGetNotification]);

  const handleSubscription = async () => {
    const token = await getFirebaseToken();
    const { status } = await notificationServer.delete(
      `/api/PushNotification/Remove/${token}`
    );
    if (status !== 200) return;
    const isSuccess = await removeFirebaseServiceWorker();

    if (isSuccess) {
      setShouldGetToken(false);
      setShouldGetNotification(false);
      setPushNotifications([]);
    }
  };

  return (
    <div>
      <div>
        {shouldGetNotification && (
          <button onClick={handleSubscription}>Remove Subscription</button>
        )}
      </div>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "10px",
        }}
      >
        <p
          style={{
            color: "#000",
          }}
        >
          Push Notification
        </p>
        <div>
          {pushNotifications.map((payload, index) => {
            const { title, body, image } = payload?.notification || {};
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  borderRadius: "5px",
                  padding: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={image}
                    alt={title}
                    style={{ maxWidth: "100%", borderRadius: "5px" }}
                  />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h2
                    style={{
                      color: "#000",
                      fontSize: "18px",
                      margin: "0",
                      marginBottom: "5px",
                    }}
                  >
                    {title}
                  </h2>
                  <p
                    style={{
                      color: "#000",
                      fontSize: "14px",
                      margin: "0",
                      marginBottom: "10px",
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PushNotification;
