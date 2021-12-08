import * as React from "react";
import { useRequest } from "ahooks";
import { Button, Drawer, message, Table } from "antd";

export const SelectRoom: React.FC<{
  visible?: boolean;
  onClose?: () => void;
  onFinish?: (roomID: string) => void;
}> = ({ visible = false, onClose, onFinish }) => {
  const { data, loading } = useRequest(
    () => window.ipcRenderer.invoke("room.findAll").catch(() => []),
    {
      ready: visible,
      refreshDeps: [visible],
      cacheKey: "room-list",
    }
  );

  const [selectRoomID, setSelectRoomID] = React.useState("");

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      size="large"
      title="选择群聊"
      extra={
        <Button
          type="primary"
          onClick={() => {
            if (selectRoomID) {
              onFinish?.(selectRoomID);
              onClose?.();
            } else {
              message.warning("请选择群聊");
            }
          }}
        >
          确定
        </Button>
      }
    >
      <Table
        loading={loading}
        dataSource={data}
        rowKey="id"
        columns={[
          {
            title: "群聊名称",
            dataIndex: "topic",
          },
          {
            title: "成员数量",
            dataIndex: "memberIdList",
            render: (memberIdList: string[]) => memberIdList.length,
          },
        ]}
        rowSelection={{
          type: "radio",
          onChange: (selectedRowKeys: React.Key[]) => {
            setSelectRoomID(`${selectedRowKeys[0]}`);
          },
        }}
      />
    </Drawer>
  );
};
