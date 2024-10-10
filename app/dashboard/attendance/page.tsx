"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

import usePersistState from "@/hooks/use-persist-state";

import { PersistAttendance } from "@/types/persist";
import { Chatter } from "@/types/chat";

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
            <Image
              src={info.getValue()}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
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

  const [data, setData] = useState<ColumnAttendance[]>([]);

  useEffect(() => {
    setData(
      attendance.map((chatter) => {
        return {
          displayName: chatter.displayName,
          profileImageUrl: chatter.profileImageUrl as string,
          followers: chatter.followers,
          presentAt: chatter.presentAt,
        };
      })
    );
  }, [attendance]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8">
      <div className="mt-8">
        <span className="text-sm">Attendees: {attendance.length}</span>

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
