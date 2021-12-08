import { Avatar, Button, Layout, Popover, Skeleton, Space } from "antd";
import * as React from "react";
import type { Contact } from "wechaty-puppet/src/mods/payloads";

import styles from "./Sider.module.less";

export const Sider = () => {
  const [userInfo, setUserInfo] = React.useState<Contact>();

  React.useEffect(() => {
    window.ipcRenderer.on("login", (event, user: Contact) => {
      window.log.info("[login]", user.name);
      setUserInfo(user);
    });
  }, []);

  return (
    <Layout.Sider className={styles.sider} width={128}>
      {userInfo ? (
        <>
          <Popover
            placement="bottom"
            content={
              <Space direction="vertical" align="center">
                <Avatar
                  shape="square"
                  size={80}
                  src={`data:image/jpeg;base64,${userInfo?.avatar}`}
                  draggable={false}
                />
                {userInfo?.name}
              </Space>
            }
          >
            <Avatar
              className={styles["sider-avatar"]}
              shape="square"
              size={40}
              src={`data:image/jpeg;base64,${userInfo?.avatar}`}
              draggable={false}
            />
          </Popover>
          <div className={styles["sider-placeholder"]} />
          <Button
            ghost
            block
            onClick={() => {
              window.ipcRenderer.send("logout");
            }}
          >
            退出
          </Button>
        </>
      ) : (
        <Skeleton active />
      )}
    </Layout.Sider>
  );
};
