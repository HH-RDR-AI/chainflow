import { ProcessTask } from "./types";
import styles from "./page.module.scss";
import { Tasks } from "@/src/components/Tasks/Tasks";

export const TasksPage = async () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tasks</h2>
        <div className={styles.tools}></div>
      </div>
      <Tasks className={styles.body} />
    </div>
  );
};

export default TasksPage;

export async function getTasks(
  definitionId?: string | null,
  instanceId?: string | null
): Promise<ProcessTask[]> {
  const query = [];

  if (definitionId) {
    query.push(`processDefinitionId=${definitionId}`);
  }

  if (instanceId) {
    query.push(`processInstanceId=${instanceId}`);
  }

  const res = await fetch(
    `http://localhost:3000/api/engine/task?${query.join("&")}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const tasks: ProcessTask[] = await res.json();
  return tasks;
}
