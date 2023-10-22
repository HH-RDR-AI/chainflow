"use client";

import { FC, useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Tasks.module.scss";
import { ProcessDefinition, ProcessInstance } from "@/app/processes/types";
import { ProcessTask } from "@/app/tasks/types";
import { getDefinitions, getTasks } from "@/src/utils/processUtils";

export const Tasks: FC<{ className?: string }> = ({ className }) => {
  const [currentProcess, setCurrentProcess] = useState<string | null>(null);
  const [currentInstance, setCurrentInstance] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [processes, setProcesses] = useState<ProcessDefinition[]>([]);
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [tasks, setTasks] = useState<ProcessTask[]>([]);

  useEffect(() => {
    const getData = async () => {
      setProcesses(await getDefinitions());
      setInstances(await getProcessInstances());
    };

    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      setCurrentInstance(null);
      setCurrentTask(null);
    };

    getData();
  }, [currentProcess]);

  useEffect(() => {
    const getData = async () => {
      setTasks(await getTasks(currentProcess, currentInstance));
    };

    getData();
  }, [currentInstance, currentProcess]);

  const task = tasks.find((task) => currentTask === task.id);

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.processes}>
        <ul className={styles.processesList}>
          {processes.map((process) => {
            return (
              <li key={process.id}>
                <strong
                  className={styles.processesEntry}
                  onClick={() => {
                    setCurrentProcess(process.id);
                    setCurrentInstance(null);
                  }}
                >
                  {process.name}
                </strong>

                <div className={styles.instances}>
                  <ul className={styles.instancesList}>
                    {instances
                      .filter(
                        (instance) => instance.definitionId === process.id
                      )
                      ?.map((instance) => {
                        return (
                          <li
                            key={instance.id}
                            className={clsx(styles.instancesItem, {
                              active: currentInstance === instance.id,
                            })}
                            onClick={() => {
                              //console.log([process.id, instance.id]);
                              setCurrentProcess(process.id);
                              setCurrentInstance(instance.id);
                            }}
                          >
                            {instance.id}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.tasks}>
        <ul className={styles.tasksList}>
          {tasks.map((task) => {
            return (
              <li
                key={task.id}
                className={clsx(styles.tasksItem, {
                  active: currentTask === task.id,
                })}
                onClick={() => {
                  setCurrentTask(task.id);
                }}
              >
                {task.name}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.props}>
        <h3 className={styles.propsTitle}>Task properties</h3>
        {!!task && (
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
        )}
      </div>
    </div>
  );
};
function getProcessInstances():
  | import("react").SetStateAction<ProcessInstance[]>
  | PromiseLike<import("react").SetStateAction<ProcessInstance[]>> {
  throw new Error("Function not implemented.");
}
