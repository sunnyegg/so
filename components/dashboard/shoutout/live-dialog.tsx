import { Dispatch, SetStateAction, useContext } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IStreamContext, StreamContext } from "@/context/stream";
import { toast } from "@/components/ui/use-toast";
import { ChannelContext, IChannelContext } from "@/context/channel";

export const LiveDialog = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const { channel } = useContext(ChannelContext) as IChannelContext;
  const { stream, setStream, createStream } = useContext(StreamContext) as IStreamContext;

  const handleCreateStream = async () => {
    const startedAt = new Date().toISOString();
    const { error, data } = await createStream({ ...stream, is_live: true, channel: channel, started_at: startedAt });
    if (error) {
      toast({
        title: "Error",
        description: error,
        duration: 5000,
        variant: "destructive",
      })
      return;
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
          <Button variant="streamegg" onClick={handleCreateStream}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}