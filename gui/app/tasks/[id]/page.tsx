import { getTask, getTaskVariables } from "@/src/utils/processUtils";
import styles from "./page.module.scss";
import Panel from "@/src/components/Panel";
import { TaskForm } from "./taskForm";
import Button from "@/src/components/Button";
import { FaCrown } from "react-icons/fa6";

export default async function TaskPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const task = await getData(id);

  if (!task) {
    return null;
  }

  const formVars = await getTaskVariables(task.id);
  const abi = formVars?.abi?.value ? JSON.parse(formVars?.abi?.value) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Task {task.name}</h1>
        <div className={styles.tools}>
          <Button icon={<FaCrown />} disabled caption="Claim" />
        </div>
      </div>
      <div className={styles.body}>
        <aside className={styles.aside}>
          <Panel title="Properties">
            <table className={styles.propsTable}>
              <tbody className={styles.propsTBody}>
                {Object.entries(task).map(([key, value]) => {
                  return (
                    <tr className={styles.propsTR} key={key}>
                      <th className={styles.propsTH}>{key}</th>
                      <td className={styles.propsTD}>{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </aside>
        <main className={styles.content}>
          {!!formVars && abi && (
            <Panel title="Task form">
              <TaskForm vars={formVars} abi={abi} />
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

async function getData(id: string) {
  return await getTask(id);
}
