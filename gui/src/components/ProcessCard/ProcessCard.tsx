"use client";

import { ProcessDefinition } from "@/app/processes/types";
import styles from "./ProcessCard.module.scss";
import { FC } from "react";
import { FaPlay } from "react-icons/fa6";
import Link from "next/link";
import clsx from "clsx";
import Button from "../Button";

export const ProcessCard: FC<{
  process: ProcessDefinition;
  className?: string;
}> = ({ process, className }) => {
  const handleNewInstance = () => {
    //
  };

  return (
    <div className={clsx(styles.container, className)}>
      <Link href={`/processes/${process.id}`} className={styles.title}>
        {process.name}
      </Link>
      <div className={styles.footer}>
        <div className={styles.entryInstances}>
          {process.instanceCount || "No"} instance
          {!process?.instanceCount || process?.instanceCount > 1 ? "s" : ""}
        </div>
        <div className={styles.actions}>
          <Button
            icon={<FaPlay />}
            caption="New Instance"
            disabled
            onClick={handleNewInstance}
          />
        </div>
      </div>
    </div>
  );
};
