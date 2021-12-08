import { Button, Space, Table } from "antd";
import * as React from "react";
import { Login } from "/@/components/Login";
import { SelectRoom } from "/@/components/SelectRoom";
import { RoomRulesSetting } from "/@/components/RoomRulesSetting";
import { RoomName } from "/@/components/RoomName";
import { useRequest } from "ahooks";

export const BotApp = () => {
  const [showSelectRoom, setShowSelectRoom] = React.useState(false);

  const [roomRulesSettingID, setRoomRulesSettingID] = React.useState("");

  const [roomRulesDefault, setRoomRulesDefault] =
    React.useState<RoomRules | null>(null);

  const { data } = useRequest<RoomRules[], any>(
    () => window.ipcRenderer.invoke("getRules"),
    {
      refreshDeps: [roomRulesSettingID],
    }
  );

  React.useEffect(() => {
    window.ipcRenderer.send("startRoomListener");
  }, [data]);

  return (
    <>
      <Table
        dataSource={data}
        rowKey={(record) => record.roomID}
        columns={[
          {
            title: "房间",
            dataIndex: "roomID",
            render: (roomID) => <RoomName roomID={roomID} />,
          },
          {
            title: "关键词",
            dataIndex: "keywords",
          },
          {
            title: "关键词模式",
            dataIndex: "keywordsMode",
            render: (text: RoomRules["keywordsMode"]) => {
              switch (text) {
                case "include":
                  return "部分包含";
                case "all":
                  return "全部包含";
                default:
                  return "未知";
              }
            },
          },
          {
            title: "指定成员",
            dataIndex: "members",
          },
          {
            title: "发送内容",
            dataIndex: "content",
          },
          {
            title: "操作",
            key: "action",
            render: (_, record: RoomRules) => (
              <Space>
                <a
                  onClick={() => {
                    setRoomRulesDefault(record);
                    setRoomRulesSettingID(record.roomID);
                  }}
                >
                  编辑
                </a>
              </Space>
            ),
          },
        ]}
        footer={() => (
          <Button
            type="dashed"
            block
            onClick={() => {
              setShowSelectRoom(true);
            }}
          >
            添加监听群聊
          </Button>
        )}
      />
      <SelectRoom
        visible={showSelectRoom}
        onClose={() => {
          setShowSelectRoom(false);
        }}
        onFinish={(roomID) => {
          const defaultData = data?.find((item) => item.roomID === roomID);
          if (defaultData) {
            setRoomRulesDefault(defaultData);
          }
          setRoomRulesSettingID(roomID);
        }}
      />
      <RoomRulesSetting
        roomID={roomRulesSettingID}
        defaultData={roomRulesDefault}
        onClose={() => {
          setRoomRulesSettingID("");
        }}
        onFinish={(rules) => {
          window.ipcRenderer.invoke("saveRules", rules).then(() => {
            setRoomRulesSettingID("");
          });
        }}
      />
      <Login />
    </>
  );
};
