"use client";

import { ProcessDefinition } from "@/app/processes/types";
import styles from "./ProcesCard.module.scss";
import { FC } from "react";
import Viewer from "../Viewer";
import { FaPlay } from "react-icons/fa6";
import Link from "next/link";

export const ProcessCard: FC<{
  process: ProcessDefinition;
  className?: string;
}> = ({ process }) => {
  const handleNewInstance = () => {
    //
  };

  return (
    <div className={styles.container}>
      <Link href={`/processes/${process.id}`} className={styles.title}>
        {process.name}
      </Link>
      <div className={styles.body}>
        <Viewer process={process.id} className={styles.entryViewer} />
      </div>
      <div className={styles.footer}>
        <div className={styles.entryInstances}>
          {process.instanceCount || "No"} instances
        </div>
        <div className={styles.actions}>
          <button onClick={handleNewInstance}>
            <FaPlay /> New
          </button>
        </div>
      </div>
    </div>
  );
};
