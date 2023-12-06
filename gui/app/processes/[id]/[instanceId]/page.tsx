import { getInstance, getTasks, getVariables } from "@/src/utils/processUtils";
import styles from "./page.module.scss";
import Viewer from "@/src/components/Viewer";
import Panel from "@/src/components/Panel";
import List from "@/src/components/List";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InstancePage({
  params: { instanceId },
}: {
  params: { instanceId: string };
}) {
  const { instance, variables, tasks } = await getData(instanceId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Instance</h1>
        <div className={styles.tabs}>
          <ul className={styles.tabsList}></ul>
        </div>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <aside className={styles.aside}>
          <Panel title="Properties">
            <table className={styles.propsTable}>
              <tbody className={styles.propsTBody}>
                {Object.entries(instance).map(([key, value]) => {
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
          <Panel title="Tasks">
            <List className={styles.list}>
              {tasks?.map((task, idx) => (
                <Link key={idx} href={`/tasks/${task.id}`}>
                  {task.id}
                  <style>{`[data-element-id="${task.taskDefinitionKey}"] {outline-color: red; outline-style: auto }`}</style>
                </Link>
              ))}
            </List>
          </Panel>
        </aside>
        <main className={styles.content}>
          <Viewer process={instance.definitionId} className={styles.viewer} />
          <Panel title="Variables" className={styles.variables}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(variables).map(([varKey, varValue]) => {
                  return (
                    <tr key={varKey}>
                      <th>{varKey}</th>
                      <td>{varValue.type}</td>
                      <td>{`${varValue.value}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </main>
      </div>
    </div>
  );
}

async function getData(id: string) {
  return {
    instance: await getInstance(id),
    variables: await getVariables(id),
    tasks: await getTasks(null, id),
  };
}
