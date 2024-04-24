"use client";

import { ProcessDefinition, ProcessInstance } from "@/app/processes/types";
import { FC, useCallback } from "react";
import { FaPlay } from "react-icons/fa6";
import Button from "../Button";
import { startNewInstance } from "@/src/utils/processUtils";

export const InstanceStarter: FC<{ process: ProcessDefinition }> = ({
  process,
}) => {
  const handleNewInstance = useCallback(() => startNewInstance(process), [process])

  return (
    <Button
            icon={<FaPlay />}
            caption="New Instance"
            onClick={handleNewInstance}
          />
  );
};
