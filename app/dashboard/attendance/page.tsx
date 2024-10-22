"use client";

import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { useMediaQuery } from "@uidotdev/usehooks";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { Chatter } from "@/types/chat";
import { Broadcast } from "@/types/broadcast";
import { SelectedChannel } from "@/types/channel";
import {
  PersistAttendance,
  PersistAuth,
  PersistChannel,
} from "@/types/persist";

import { TwitchContext } from "@/contexts/twitch";

type ColumnAttendance = {
  displayName: string;
  profileImageUrl: string;
  followers: number;
  presentAt: string;
};

export default function AttendancePage() {
  const columnHelper = createColumnHelper<ColumnAttendance>();

  const columns = [
    columnHelper.accessor("profileImageUrl", {
      header: "",
      size: 10,
      cell: (info) => {
        return (
          <div>
            <Avatar>
              <AvatarImage src={info.getValue()} alt="avatar" />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>
        );
      },
    }),
    columnHelper.accessor("displayName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("followers", {
      header: "Followers",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("presentAt", {
      header: "Present At",
      cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD, HH:mm:ss"),
    }),
  ];

  const [attendance] = usePersistState(
    PersistAttendance.name,
    PersistAttendance.defaultValue
  ) as [Chatter[]];
  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [channel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel];

  const { attendance: attendanceTemp, setAttendance } =
    useContext(TwitchContext).chat;
  const { isLive } = useContext(TwitchContext).stream;

  const [data, setData] = useState<ColumnAttendance[]>([]);
  const [pastBroadcasts, setPastBroadcasts] = useState<Broadcast[]>([]);
  const [selectedBroadcast, setSelectedBroadcast] = useState<string>("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isPastBroadcastLoading, setIsPastBroadcastLoading] = useState(true);

  const handleSelectBroadcast = (token: string, login: string, id: string) => {
    setIsTableLoading(true);
    setSelectedBroadcast(id);
    getBroadcastDetail(token, login, id).then((res) => {
      if (res.status) {
        const data = res.data as Chatter[];
        setAttendance(data);
      } else {
        setAttendance([]);
        setData([]);
      }
      setIsTableLoading(false);
    });
  };

  const handleBack = () => {
    setSelectedBroadcast("");
    setAttendance([]);
    setData([]);
  };

  useEffect(() => {
    if (attendanceTemp.length) {
      setData(
        attendanceTemp.map((chatter) => {
          return {
            displayName: chatter.displayName,
            profileImageUrl: chatter.profileImageUrl as string,
            followers: chatter.followers,
            presentAt: chatter.presentAt,
          };
        })
      );
    }
  }, [attendanceTemp]);

  useEffect(() => {
    if (attendance.length) {
      setAttendance(attendance);
    }
  }, [attendance]);

  useEffect(() => {
    if (!auth.accessToken) return;

    getPastBroadcasts(auth.accessToken, channel.login).then((res) => {
      if (res.status) {
        setPastBroadcasts(res.data);
      } else {
        setPastBroadcasts([]);
      }
      setIsPastBroadcastLoading(false);
    });
  }, [auth]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8">
      {isLive || selectedBroadcast !== "" ? (
        <div className="mt-8">
          <div className="flex items-center">
            {!isLive && (
              <Button
                variant={"streamegg"}
                className="mr-4"
                onClick={handleBack}
              >
                Back
              </Button>
            )}

            <span className="text-sm">Attendees: {attendanceTemp.length}</span>
          </div>

          {isTableLoading ? (
            <Skeleton className="mt-4 h-[300px] rounded-md p-4" />
          ) : (
            <Table className="mt-4">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-white"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <div>
          <h3>Past Broadcasts</h3>

          <div>
            {!isPastBroadcastLoading && !pastBroadcasts.length && (
              <p>No past broadcasts found</p>
            )}
            {isPastBroadcastLoading
              ? new Array(3)
                  .fill(undefined)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="mt-4 h-[100px] rounded-md p-4"
                    />
                  ))
              : pastBroadcasts.map((broadcast) => {
                  return (
                    <div
                      key={broadcast.id}
                      className="mt-4 flex items-center rounded-md bg-so-secondary-color p-4 text-sm md:justify-between"
                    >
                      <div className="mr-16">
                        <div className="flex gap-2">
                          <span className="text-so-secondary-text-color">
                            Title:
                          </span>
                          <span>{broadcast.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-so-secondary-text-color">
                            Game:
                          </span>
                          <span>{broadcast.gameName}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-so-secondary-text-color">
                            Started At:
                          </span>
                          <span>
                            {dayjs(broadcast.startDate).format(
                              "YYYY-MM-DD, HH:mm:ss"
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <ButtonAttendance
                          onClick={() =>
                            handleSelectBroadcast(
                              auth.accessToken,
                              channel.login,
                              broadcast.streamId
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}

const ButtonAttendance = ({ onClick }: { onClick: () => void }) => {
  const isMd = useMediaQuery("(min-width: 768px)");

  return (
    <Button variant={"streamegg"} onClick={onClick}>
      {isMd ? (
        "See Attendance"
      ) : (
        <Eye width={36} className="text-so-primary-color" />
      )}
    </Button>
  );
};

const getPastBroadcasts = async (token: string, login: string) => {
  const res = await fetch(`/api/broadcast/past?login=${login}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};

const getBroadcastDetail = async (token: string, login: string, id: string) => {
  const res = await fetch(`/api/broadcast/detail?login=${login}&id=${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};
