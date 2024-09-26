"use client";

import { useState } from "react";

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

import StreamCard from "../components/stream";
import Divider from "@/components/common/divider";

type ColumnAttendance = {
  displayName: string;
  profileImageUrl: string;
  followers: number;
  presentAt: string;
};

const dummyData: ColumnAttendance[] = [
  {
    displayName: "sunnyegg21",
    profileImageUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/eae32a3c-19e1-4682-8df9-bdcda04ba746-profile_image-300x300.png",
    followers: 100,
    presentAt: "2023-04-01",
  },
  {
    displayName: "sunnyegg21",
    profileImageUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/eae32a3c-19e1-4682-8df9-bdcda04ba746-profile_image-300x300.png",
    followers: 100,
    presentAt: "2023-04-01",
  },
  {
    displayName: "sunnyegg21",
    profileImageUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/eae32a3c-19e1-4682-8df9-bdcda04ba746-profile_image-300x300.png",
    followers: 100,
    presentAt: "2023-04-01",
  },
  {
    displayName: "sunnyegg21",
    profileImageUrl:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/eae32a3c-19e1-4682-8df9-bdcda04ba746-profile_image-300x300.png",
    followers: 100,
    presentAt: "2023-04-01",
  },
];

export default function AttendancePage() {
  const columnHelper = createColumnHelper<ColumnAttendance>();

  const columns = [
    columnHelper.accessor("profileImageUrl", {
      header: "",
      size: 10,
      cell: (info) => {
        return (
          <div>
            <img
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
      cell: (info) => info.getValue(),
    }),
  ];

  const [data, _setData] = useState(() => [...dummyData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8">
      <StreamCard />

      <Divider />

      <Table className="mt-8">
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
  );
}
