import {
  ProcessDefinition,
  ProcessInstance,
  ProcessVariables,
} from "@/app/processes/types";
import { ProcessTask } from "@/app/tasks/types";

export const getInstances = async (id?: string): Promise<ProcessInstance[]> => {
  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/process-instance${
      !!id ? `?processDefinitionId=${id}` : ""
    }`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const instances: ProcessInstance[] = await res.json();

  return instances;
};

export const getDefinition = async (id: string): Promise<ProcessDefinition> => {
  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/process-definition?processDefinitionId=${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const processes: ProcessDefinition[] = await res.json();

  return processes[0];
};

export const getInstance = async (id: string): Promise<ProcessInstance> => {
  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/process-instance/${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const instance: ProcessInstance = await res.json();

  return instance;
};

export const getVariables = async (id: string): Promise<ProcessVariables> => {
  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/process-instance/${id}/variables`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const vars: ProcessVariables = await res.json();

  return vars;
};

export const getDefinitions = async (): Promise<ProcessDefinition[]> => {
  const res = await fetch(
    "https://chainflow.dexguru.biz/dashboard/api/engine/process-definition"
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const processes: ProcessDefinition[] = await res.json();

  await Promise.all(
    processes.map(async (process, idx) => {
      processes[idx].instanceCount = await getInstanceCount(process.id);
    })
  );

  return processes;
};

export const getInstanceCount = async (id: string): Promise<number> => {
  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/process-instance/count?processDefinitionId=${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const { count } = await res.json();

  return count;
};

export const getTasks = async (
  definitionId?: string | null,
  instanceId?: string | null
): Promise<ProcessTask[]> => {
  const query = [];

  if (definitionId) {
    query.push(`processDefinitionId=${definitionId}`);
  }

  if (instanceId) {
    query.push(`processInstanceId=${instanceId}`);
  }

  const res = await fetch(
    `https://chainflow.dexguru.biz/dashboard/api/engine/task?${query.join("&")}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const tasks: ProcessTask[] = await res.json();
  return tasks;
};
