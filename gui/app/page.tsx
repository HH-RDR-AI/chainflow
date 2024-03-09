import Panel from "@/src/components/Panel";
import styles from "./page.module.scss";
import {
  getDefinitionStats,
  getDefinitions,
  getInstances,
  getTasks,
} from "@/src/utils/processUtils";
import Box from "@/src/components/Box";

export default async function TasksPage() {
  const { stats, tasks, definitions, instances } = await getData();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <div className={styles.dashboard}>
          <Panel title={`Definitions`}>
            <table>
              <thead>
                <tr>
                  <th>Definition</th>
                  <th>Instances</th>
                  <th>Failed Jobs</th>
                  <th>Incidents</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{stat.definition.name}</strong>
                    </td>
                    <td>{stat.instances}</td>
                    <td>{stat.failedJobs}</td>
                    <td>{stat.incidents.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Tasks">
            <Box>
              {tasks.filter((task) => !task.assignee).length} of {tasks.length}{" "}
              unassigned
            </Box>
          </Panel>
        </div>
      </div>
    </div>
  );
}

async function getData() {
  return {
    stats: await getDefinitionStats(),
    tasks: await getTasks(),
  };
}
