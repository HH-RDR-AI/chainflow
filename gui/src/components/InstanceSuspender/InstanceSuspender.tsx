"use client";

import { ProcessInstance } from "@/app/processes/types";
import { FC } from "react";
import { FaPlay } from "react-icons/fa6";
import Button from "../Button";

export const InstanceSuspender: FC<{ instance: ProcessInstance }> = ({
  instance,
}) => {
  if (!instance.suspended) {
    return null;
  }

  const makeSuspended = async (id: string, state: boolean) => {
    const res = await fetch(`api/engine/process-instance/${id}/suspended`, {
      method: "PUT",
      body: JSON.stringify({ suspended: state }),
    });

    if (!res.ok) {
      const json = await res.json();
      if (json?.body?.message) {
        alert(json?.body?.message);
      }

      console.log(`Failed to deploy data: ${res.statusText} [${res.status}]`);
      return;
    }

    if (window === undefined) {
      return;
    }

    window.location.reload();
  };

  return (
    <Button
      icon={<FaPlay />}
      caption="Resume"
      onClick={() => {
        makeSuspended(instance.id, false);
      }}
    />
  );
};
