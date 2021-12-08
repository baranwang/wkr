import { Button, Drawer, Form, Input, Radio, Select } from "antd";
import * as React from "react";

export const RoomRulesSetting: React.FC<{
  roomID?: string;
  defaultData?: RoomRules | null;
  onClose?: () => void;
  onFinish?: (values: RoomRules) => void;
}> = ({ roomID, defaultData, onClose, onFinish }) => {
  const [from] = Form.useForm<RoomRules>();

  React.useEffect(() => {
    if (defaultData) {
      from.setFieldsValue({ ...defaultData });
    }
  }, [defaultData]);

  React.useEffect(() => {
    if (roomID) {
      from.setFieldsValue({ roomID });
    }
  }, [roomID]);

  return (
    <>
      <Drawer
        visible={!!roomID}
        extra={
          <Button
            type="primary"
            onClick={() => {
              from.submit();
            }}
          >
            保存
          </Button>
        }
        onClose={onClose}
      >
        <Form
          form={from}
          layout="vertical"
          onFinish={(rules) => {
            onFinish?.(rules);
            onClose?.();
          }}
        >
          <Form.Item name="roomID" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            label="关键词"
            name="keywords"
            rules={[
              {
                required: true,
                message: "请输入关键词",
              },
            ]}
          >
            <Select mode="tags" tokenSeparators={[","]} />
          </Form.Item>
          <Form.Item
            label="关键词模式"
            name="keywordsMode"
            rules={[
              {
                required: true,
                message: "请选择关键词模式",
              },
            ]}
          >
            <Radio.Group
              options={[
                {
                  label: "部分命中",
                  value: "include",
                },
                {
                  label: "全部命中",
                  value: "all",
                },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
          <Form.Item
            label="指定成员"
            name="members"
            extra="为空则不限定发排成员"
          >
            <Select mode="multiple" />
          </Form.Item>
          <Form.Item
            label="发送内容"
            name="content"
            rules={[
              {
                required: true,
                message: "请输入发送内容",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
