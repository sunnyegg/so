"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Divider from "@/components/common/divider";
import { toast } from "@/components/ui/use-toast";
import StreamCard from "@/app/dashboard/components/stream";
import ShoutoutManager from "@/app/dashboard/shoutout/components/manager";

export default function ShoutoutPage() {
  const [open, setOpen] = useState(false);
  const [tempChatter, setTempChatter] = useState<any>({});

  const router = useRouter();

  return (
    <div className="mt-8">
      <StreamCard />

      <Divider />

      {/* not live and not connected */}
      <div className="animate-fade-in mt-8 text-center">
        Connecting to chat...
      </div>

      <ShoutoutManager />

      {/* not live */}
      <div className="mt-8 text-center">
        <div className="animate-fade-in">
          It seems that you are not live right now...
        </div>
        <Button
          className="mt-4"
          variant="streamegg"
          onClick={() => setOpen(true)}
        >
          I am going to live in a minute
        </Button>
      </div>
    </div>
  );
}
