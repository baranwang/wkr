import { ConfigProvider, Layout } from "antd";
import locale from "antd/lib/locale/zh_CN";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BotApp } from "./app";
import { Sider } from "/@/components/Sider";

import "./global.less";
import styles from "./index.module.less";

const App = () => {
  return (
    <ConfigProvider locale={locale}>
      <Layout className={styles.app}>
        <Sider />
        <Layout.Content className={styles["app-content"]}>
          <BotApp />
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
};

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
