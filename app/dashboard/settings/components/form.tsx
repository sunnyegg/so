import { memo, useEffect, useState } from "react";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

import { Settings } from "@/types/settings";

const FormSchema = z.object({
  autoSo: z.boolean().default(false),
  autoSoDelay: z.number().default(0),
  blacklistUsernames: z.string().default(""),
  blacklistWords: z.string().default(""),
});

function SettingsForm({
  data,
  updateSettings,
}: {
  data: Settings;
  updateSettings: (data: Settings) => void;
}) {
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultValues = {
    ...data,
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    const lettersAndNumbersOnly = /^[a-zA-Z0-9]+$/;
    // trim whitespaces from blacklistUsernames and blacklistWords
    // and check if the username/word contains invalid characters
    const trimmedBlacklistUsernames = [];
    const trimmedBlacklistWords = [];
    for (const b of data.blacklistUsernames.split(",")) {
      const trimmed = b.trim();
      if (trimmed.length > 0) {
        if (!lettersAndNumbersOnly.test(trimmed)) {
          form.setError("blacklistUsernames", {
            message: `Username "${trimmed}" contains invalid characters`,
          });
          return;
        }
        trimmedBlacklistUsernames.push(trimmed);
      }
    }
    for (const b of data.blacklistWords.split(",")) {
      const trimmed = b.trim();
      if (trimmed.length > 0) {
        trimmedBlacklistWords.push(trimmed);
      }
    }
    data.blacklistUsernames = trimmedBlacklistUsernames.join(",");
    data.blacklistWords = trimmedBlacklistWords.join(",");

    updateSettings(data);
    setIsLoading(false);
    setIsEdited(false);

    toast({
      title: "Settings saved",
      description: "Your settings have been saved",
      variant: "success",
      duration: 3000,
    });
  };

  const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEdited(false);
    form.reset(defaultValues);
  };

  useEffect(() => {
    const subs = form.watch((val: any) => {
      const keys = Object.keys(val);
      let isAllDefault = false;

      for (const key of keys) {
        // @ts-ignore
        if (val[key] === defaultValues[key]) {
          isAllDefault = true;
        } else {
          isAllDefault = false;
          break;
        }
      }

      if (!isAllDefault) {
        setIsEdited(true);
      } else {
        setIsEdited(false);
      }
    });
    return () => subs.unsubscribe();
  }, [form.watch()]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-4"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="autoSo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg bg-so-secondary-color p-3">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold text-so-primary-text-color">
                    Auto Shoutout
                  </FormLabel>
                  <FormDescription className="text-so-secondary-text-color">
                    No more clicking the shoutout button manually.
                  </FormDescription>
                  <FormMessage />
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="autoSoDelay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg bg-so-secondary-color p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold text-so-primary-text-color">
                    Auto Shoutout Delay (Seconds)
                  </FormLabel>
                  <FormDescription className="text-so-secondary-text-color">
                    Add delay to auto shoutout, so people will not sus you from
                    using bot.
                  </FormDescription>
                  <FormMessage />
                </div>
                <FormControl className="max-w-[4rem]">
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={10}
                    className="text-so-primary-color"
                    onChange={(e) => {
                      form.setValue("autoSoDelay", Number(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="blacklistUsernames"
            render={({ field }) => (
              <FormItem className="flex flex-col rounded-lg bg-so-secondary-color p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold text-so-primary-text-color">
                    Blacklist Usernames
                  </FormLabel>
                  <FormDescription className="text-so-secondary-text-color">
                    Blacklist usernames from shoutout and attendance.
                  </FormDescription>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="example: sunnyegg21,nightbot,streamelements"
                    className="text-so-primary-color"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="blacklistWords"
            render={({ field }) => (
              <FormItem className="flex flex-col rounded-lg bg-so-secondary-color p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold text-so-primary-text-color">
                    Blacklist Words
                  </FormLabel>
                  <FormDescription className="text-so-secondary-text-color">
                    Blacklist words from shoutout and attendance. Usually used
                    for blacklisting bot's words.
                  </FormDescription>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="example: buy,viewers,subscribers"
                    className="text-so-primary-color"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button
            disabled={!isEdited}
            variant={isEdited ? "streamegg-secondary" : "streamegg-disabled"}
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            disabled={!isEdited}
            variant={isEdited ? "streamegg" : "streamegg-disabled"}
            className="flex-1"
            isLoading={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default memo(SettingsForm);
