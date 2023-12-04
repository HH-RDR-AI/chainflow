import styles from "./TaskCard.module.scss";
import { FC } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ProcessTask } from "@/app/tasks/types";

export const TaskCard: FC<{
  task: ProcessTask;
  className?: string;
}> = ({ task, className }) => {
  return (
    <div className={clsx(styles.container, className)}>
      <Link href={`/tasks/${task.id}`} className={styles.title}>
        {task.name}
      </Link>
      <div className={styles.footer}>
        <Link
          href={`/processes/${task.processDefinitionId}/${task.processInstanceId}`}
          className={styles.title}
        >
          <small>{task.processInstanceId}</small>
        </Link>
      </div>
    </div>
  );
};
