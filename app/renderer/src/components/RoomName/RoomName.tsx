import * as React from "react";
import { useRequest } from "ahooks";
import type { Room } from "wechaty-puppet/src/mods/payloads";

export const RoomName: React.FC<{
  roomID: string;
}> = ({ roomID }) => {
  const { data } = useRequest<Room, any>(
    () => window.ipcRenderer.invoke("getRoom", roomID),
    {
      refreshDeps: [roomID],
      cacheKey: `room-${roomID}`,
    }
  );
  return <>{data?.topic}</>;
};
