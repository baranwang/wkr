import { ConfigProvider, Layout, Spin } from "antd";
import locale from "antd/lib/locale/zh_CN";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BotApp } from "./app";
import { Sider } from "/@/components/Sider";

import "./global.less";
import styles from "./index.module.less";

const App = () => {
  const [botReady, setBotReady] = React.useState(false);

  React.useEffect(() => {
    let ready = false;
    const readyInterval = setInterval(() => {
      if (ready) {
        setBotReady(true);
        clearInterval(readyInterval);
      } else {
        window.ipcRenderer.invoke("botReady").then((status) => {
          ready = status;
          setBotReady(status);
        });
      }
    }, 500);
  }, []);

  React.useEffect(() => {
    if (botReady) {
      window.ipcRenderer.send("startRoomListener");
    }
  }, [botReady]);

  return (
    <ConfigProvider locale={locale}>
      <Spin wrapperClassName={styles.spin} spinning={!botReady} tip="启动中…">
        <Layout className={styles.app}>
          <Sider />
          <Layout.Content className={styles["app-content"]}>
            <BotApp />
          </Layout.Content>
        </Layout>
      </Spin>
    </ConfigProvider>
  );
};

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
