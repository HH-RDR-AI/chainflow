import {
  ProcessDefinition,
  ProcessInstance,
  ProcessVariables,
} from "@/app/processes/types";
import { ProcessTask, TaskVariables } from "@/app/tasks/types";

export const fetchEngine = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<any> => {
  const hostUrl =
    typeof window === "undefined"
      ? "https://chainflow-engine.dexguru.biz/engine-rest"
      : "/dashboard/api/engine";

  try {
    const res = await fetch(`${hostUrl}/${input}`, init);

    if (!res.ok) {
      console.log(`Failed to fetch data: ${res.statusText} [${res.status}]`);
    }

    return await res.json();
  } catch (e) {
    console.log(`Failed to fetch data: ${e}`);
  }
};

export const getInstances = async (id?: string): Promise<ProcessInstance[]> => {
  const instances: ProcessInstance[] = await fetchEngine(
    `process-instance${!!id ? `?processDefinitionId=${id}` : ""}`
  );

  return instances;
};

export const getInstance = async (id: string): Promise<ProcessInstance> => {
  const instance: ProcessInstance = await fetchEngine(`process-instance/${id}`);

  return instance;
};

export const getDefinitions = async (): Promise<ProcessDefinition[]> => {
  const processes: ProcessDefinition[] = await fetchEngine(
    "process-definition"
  );

  await Promise.all(
    processes.map(async (process, idx) => {
      processes[idx].instanceCount = await getInstanceCount(process.id);
    })
  );

  return processes;
};

export const getDefinition = async (id: string): Promise<ProcessDefinition> => {
  const processes: ProcessDefinition = await fetchEngine(
    `process-definition/${id}`
  );

  return processes;
};

export const getDefinitionStats = async (): Promise<
  {
    id: string;
    instances: number;
    failedJobs: number;
    definition: ProcessDefinition;
    incidents: [];
  }[]
> => {
  return await fetchEngine(`process-definition/statistics`);
};

export const getVariables = async (id: string): Promise<ProcessVariables> => {
  const vars: ProcessVariables = await fetchEngine(
    `process-instance/${id}/variables`
  );

  return vars;
};

export const getDefinitionXML = async (id: string) => {
  const { bpmn20Xml } = await fetchEngine(`process-definition/${id}/xml`);

  return bpmn20Xml;
};

export const getInstanceCount = async (id: string): Promise<number> => {
  const { count } = await fetchEngine(
    `process-instance/count?processDefinitionId=${id}`
  );

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

  const tasks: ProcessTask[] = await fetchEngine(`task?${query.join("&")}`);
  return tasks;
};

export const getTask = async (id?: string | null): Promise<ProcessTask> => {
  return await fetchEngine(`task/${id}`);
};

export const getTaskVariables = async (
  taskId: string
): Promise<TaskVariables> => {
  const vars: TaskVariables = await fetchEngine(
    `task/${taskId}/form-variables`
  );
  return vars;
};

export const setTaskVariables = async (
  taskId: string,
  variables: TaskVariables
): Promise<number> => {
  const body = {
    modifications: variables,
  };
  const res = await fetchEngine(`task/${taskId}/variables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(
      `Failed to set variables: ${res.statusText} [${res.status}]`
    );
  }

  return res.status;
};

export const completeTask = async (
  taskId: string,
  variables: TaskVariables
): Promise<number> => {
  const body = {
    variables,
  };
  const res = await fetchEngine(`task/${taskId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(
      `Failed to complete task with variables: ${res.statusText} [${res.status}]`
    );
  }

  return res.status;
};
