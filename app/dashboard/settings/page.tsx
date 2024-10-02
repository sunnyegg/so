"use client";

import { Switch } from "@/components/ui/switch";
import StreamCard from "../components/stream";
import Divider from "@/components/common/divider";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const FormSchema = z.object({
  autoSo: z.boolean().default(false),
  autoSoDelay: z.number().default(0),
});

export default function SettingsPage() {
  const defaultValues = {
    autoSo: false,
    autoSoDelay: 0,
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const [isEdited, setIsEdited] = useState<boolean>(false);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data);
  };

  const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEdited(false);
    form.reset();
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
    <div className="mt-8">
      <StreamCard />

      <Divider />

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
                <FormItem className="flex flex-row items-center justify-between rounded-lg bg-so-secondary-color p-3">
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg bg-so-secondary-color p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold text-so-primary-text-color">
                      Auto Shoutout Delay
                    </FormLabel>
                    <FormDescription className="text-so-secondary-text-color">
                      Add delay to auto shoutout, so people will not sus you
                      from using bot.
                    </FormDescription>
                    <FormMessage />
                  </div>
                  <FormControl className="max-w-[4rem]">
                    <Input
                      {...field}
                      type="number"
                      placeholder="Delay in minutes"
                      min={0}
                      max={60}
                      className="text-so-primary-color"
                      onChange={(e) => {
                        form.setValue("autoSoDelay", Number(e.target.value));
                      }}
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
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
