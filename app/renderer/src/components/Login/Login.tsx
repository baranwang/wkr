import { Modal, Image } from "antd";
import * as React from "react";
import * as QRCode from "qrcode";

import styles from "./Login.module.less";

enum ScanStatus {
  Unknown = 0,
  Cancel = 1,
  Waiting = 2,
  Scanned = 3,
  Confirmed = 4,
  Timeout = 5,
}

export const Login = () => {
  const [qrCode, setQrCode] = React.useState("");

  React.useEffect(() => {
    window.ipcRenderer.on("scan", (event, qrcode, status) => {
      if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        QRCode.toDataURL(qrcode, {
          width: 640,
          margin: 0,
        }).then((url) => {
          setQrCode(url);
        });
      } else {
        setQrCode("");
      }
    });
  }, []);

  return (
    <Modal
      className={styles.login}
      visible={!!qrCode}
      closable={false}
      footer={null}
      width={320}
      maskStyle={{ backgroundColor: "#fff" }}
    >
      <Image src={qrCode} preview={false} />
    </Modal>
  );
};
