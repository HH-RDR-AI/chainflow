import List from "@/src/components/List";
import styles from "./page.module.scss";
import { getTasks } from "@/src/utils/processUtils";
import TaskCard from "@/src/components/TaskCard";
import Link from "next/link";

export default async function TasksPage() {
  const tasks = await getData();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tasks</h1>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        {!!tasks.length && (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Instance</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task, idx) => {
                return (
                  <tr key={idx}>
                    <td>
                      <Link href={`/tasks/${task.id}`} className={styles.title}>
                        {task.name}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/processes/${task.processDefinitionId}/${task.processInstanceId}`}
                      >
                        {task.processInstanceId}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

async function getData() {
  return await getTasks();
}
