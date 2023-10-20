"use client";

import { FC, useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Tasks.module.scss";
import { getDefinitions } from "@/app/processes/page";
import { ProcessDefinition, ProcessInstance } from "@/app/processes/types";
import { getInstances } from "@/app/processes/[id]/page";
import { ProcessTask } from "@/app/tasks/types";
import { getTasks } from "@/app/tasks/page";

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
    };

    getData();
  }, []);

  useEffect(() => {
    if (!currentProcess) {
      return;
    }

    const getData = async () => {
      setInstances(await getInstances(currentProcess));
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
          <li
            className={styles.processesItem}
            onClick={() => {
              setCurrentProcess(null);
            }}
          >
            All processes
          </li>
          {processes.map((process) => {
            return (
              <li
                key={process.id}
                className={clsx(styles.processesItem, {
                  active: currentProcess === process.id,
                })}
                onClick={() => {
                  setCurrentProcess(process.id);
                }}
              >
                {process.name}
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.instances}>
        <ul className={styles.instancesList}>
          <li
            className={styles.instancesItem}
            onClick={() => {
              setCurrentInstance(null);
            }}
          >
            All instances
          </li>
          {instances.map((instance) => {
            return (
              <li
                key={instance.id}
                className={clsx(styles.instancesItem, {
                  active: currentInstance === instance.id,
                })}
                onClick={() => {
                  setCurrentInstance(instance.id);
                }}
              >
                {instance.id}
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
        {!!task && (
          <div className={styles.props}>
            <h3 className={styles.propsTitle}>Task properties</h3>
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
          </div>
        )}
      </div>
    </div>
  );
};
