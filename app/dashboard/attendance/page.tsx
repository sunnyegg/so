"use client";

import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import usePersistState from "@/hooks/use-persist-state";

import { PersistAttendance } from "@/types/persist";
import { Chatter } from "@/types/chat";

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

  const { attendance: attendanceTemp, setAttendance } =
    useContext(TwitchContext).chat;

  const [data, setData] = useState<ColumnAttendance[]>([]);

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8">
      <div className="mt-8">
        <span className="text-sm">Attendees: {attendanceTemp.length}</span>

        <Table>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
