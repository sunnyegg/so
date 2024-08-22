import { Dispatch, SetStateAction, useContext } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { IStreamContext, StreamContext } from "@/context/stream";
import { ChannelContext, IChannelContext } from "@/context/channel";
import { AuthContext, AuthData, IAuthContext } from "@/context/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import useLogout from "@/hooks/auth/use-logout";
import useRefreshToken from "@/hooks/auth/use-refresh-token";

export const LiveDialog = ({ open, setOpen, router }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, router: AppRouterInstance }) => {
  const { auth, setAuth } = useContext(AuthContext) as IAuthContext;
  const { channel } = useContext(ChannelContext) as IChannelContext;
  const { stream, setStream, createStream } = useContext(StreamContext) as IStreamContext;

  const handleCreateStream = async (authData: AuthData) => {
    if (authData.access_token === "") return;

    const startedAt = new Date().toISOString();
    const streamData = {
      ...stream, is_live: true, channel: channel, started_at: startedAt
    }

    const { error, data } = await createStream(authData.access_token, streamData);
    if (error) {
      if (error === "expired token") {
        const { error, data } = await useRefreshToken(authData.refresh_token);
        if (error) {
          useLogout(authData.access_token);
          return router.push("/");
        }

        setAuth({ ...authData, access_token: data });
        return;
      }

      return toast({
        title: "Error",
        description: error,
        duration: 5000,
        variant: "destructive",
      })
    }

    setStream({ ...data, is_live: true, channel: channel, started_at: startedAt });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-so-primary-color text-so-neutral-color border-0">
        <DialogHeader className="gap-4">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription className="text-so-neutral-color">
            Check the <b>Title</b> and the <b>Game</b> before you live.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 md:gap-0">
          <Button variant="streamegg" onClick={() => handleCreateStream(auth)}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}