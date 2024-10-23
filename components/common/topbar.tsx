"use client";

import { memo } from "react";

import Link from "next/link";
import { Coiny, Fira_Sans } from "next/font/google";
import { usePathname } from "next/navigation";

import { Check, AlignJustify } from "lucide-react";

import LoginButton from "./login-button";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth, PersistVersion } from "@/types/persist";
import { ModeratedChannel, SelectedChannel } from "@/types/channel";

const coiny = Coiny({ subsets: ["latin"], weight: ["400"] });
const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type TopBarProps = {
  handleLogout?: () => void;
  moderatedChannels?: ModeratedChannel[];
  channel?: SelectedChannel;
  setChannel?: React.Dispatch<React.SetStateAction<SelectedChannel>>;
};

function TopBar(props: TopBarProps) {
  const { handleLogout, moderatedChannels, channel, setChannel } = props;

  const pathname = usePathname();
  const isActivePath = (path: string) =>
    pathname === path ? "bg-so-secondary-color rounded-md" : "";
  const isDashboardPath = () => pathname && pathname.startsWith("/dashboard");

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [version] = usePersistState(
    PersistVersion.name,
    PersistVersion.defaultValue
  ) as [string];

  const handleChangeChannel = async (
    userId: string,
    channel: SelectedChannel
  ) => {
    if (userId !== channel.id) {
      if (
        moderatedChannels &&
        !moderatedChannels.find((ch) => ch.id === channel.id)
      ) {
        toast({
          title: "You are not a moderator of this channel",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    }

    setChannel && setChannel(channel);
    toast({
      title: "Channel changed",
      description: "Refreshing page...",
      duration: 1500,
      variant: "success",
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <section className={`flex items-center justify-between ${fira.className}`}>
      {isDashboardPath() && <DropdownMenuMobile />}

      <div className={`mx-auto flex text-[1.2rem] md:mx-0 ${coiny.className}`}>
        STREAM
        <span className="text-so-accent-color">EGG</span>
      </div>

      {!isDashboardPath() && (
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={"/support"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/support")}`}
          >
            SUPPORT
          </Link>
          <Link
            href={"/about"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/about")}`}
          >
            ABOUT
          </Link>
          <Link
            href={"/how-it-works"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/how-it-works")}`}
          >
            HOW IT WORKS?
          </Link>

          {auth.user ? (
            <Avatar>
              <AvatarImage
                src={auth.user.profileImageUrl}
                alt={auth.user.login}
              />
              <AvatarFallback>{auth.user.login.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <LoginButton variant="streamegg-outline" text="Login" />
          )}
        </div>
      )}

      {isDashboardPath() && (
        <>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href={"/dashboard/shoutout"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/shoutout")}`}
            >
              SHOUTOUT
            </Link>
            <Link
              href={"/dashboard/attendance"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/attendance")}`}
            >
              ATTENDANCE
            </Link>
            <Link
              href={"/dashboard/settings"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/settings")}`}
            >
              SETTINGS
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={channel?.profileImageUrl}
                  alt={channel?.login}
                />
                <AvatarFallback>{channel?.login?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 bg-so-secondary-color text-so-primary-text-color">
              <DropdownMenuLabel>{channel?.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change Channel</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-so-secondary-color text-so-primary-text-color">
                    <DropdownMenuItem
                      onClick={() =>
                        handleChangeChannel(auth.user?.id, {
                          id: auth.user?.id,
                          login: auth.user?.login,
                          displayName: auth.user?.displayName,
                          profileImageUrl: auth.user?.profileImageUrl,
                        })
                      }
                    >
                      <ChannelItem
                        current={channel?.login || ""}
                        login={auth.user?.login}
                        displayName="My Channel"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {moderatedChannels &&
                      moderatedChannels.length &&
                      moderatedChannels.map((ch) => {
                        return (
                          <DropdownMenuItem
                            key={ch.id}
                            onClick={() =>
                              handleChangeChannel(auth.user?.id, {
                                id: ch.id,
                                login: ch.login,
                                displayName: ch.displayName,
                                profileImageUrl: ch.profileImageUrl,
                              })
                            }
                          >
                            <ChannelItem
                              current={channel?.login || ""}
                              login={ch.login}
                              displayName={ch.displayName}
                            />
                          </DropdownMenuItem>
                        );
                      })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem>Version: {version}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </section>
  );
}

const DropdownMenuMobile = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="block cursor-pointer md:hidden">
        <AlignJustify size={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-4 mt-2 bg-so-secondary-color text-so-primary-text-color">
        <DropdownMenuItem asChild>
          <Link href={"/dashboard/shoutout"}>Shoutout</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/dashboard/attendance"}>Attendance</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/dashboard/settings"}>Settings</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ChannelItem = ({
  current,
  login,
  displayName,
}: {
  current: string;
  login: string;
  displayName: string;
}) => {
  return (
    <>
      {displayName} {current === login && <Check className="ml-2" size={16} />}
    </>
  );
};

export default memo(TopBar);
