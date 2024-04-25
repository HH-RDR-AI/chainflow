'use client'

import { FC, useEffect, useState } from 'react'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { AbiFunction } from 'abitype'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import {
  useAccount,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi'

import { ProcessDefinition, ProcessInstance } from '@/app/processes/types'
import { ProcessTask, TaskVariables } from '@/app/tasks/types'
import {
  completeTask,
  getDefinitions,
  getInstances,
  getTaskVariables,
  getTasks,
  setTaskVariables,
} from '@/src/utils/processUtils'

import Button from '../Button'

import styles from './Tasks.module.scss'

export const Tasks: FC<{ className?: string }> = ({ className }) => {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [currentProcess, setCurrentProcess] = useState<string | null>(null)
  const [currentInstance, setCurrentInstance] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [processes, setProcesses] = useState<ProcessDefinition[]>([])
  const [instances, setInstances] = useState<ProcessInstance[]>([])
  const [tasks, setTasks] = useState<ProcessTask[]>([])

  const [formVars, setFormVars] = useState<TaskVariables | undefined>(undefined)
  const [abi, setAbi] = useState<AbiFunction | undefined>(undefined)

  const { register, handleSubmit, formState, watch, reset } = useForm()
  const to = watch('_to')
  const value = watch('_value')

  useEffect(() => {
    if (!address && openConnectModal) {
      openConnectModal()
    }
  }, [address])

  const { config } = usePrepareSendTransaction({
    to: to,
    value: value,
    account: address,
  })

  const { data, sendTransaction } = useSendTransaction(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    if (!currentTask || !data?.hash) {
      return
    }
    const transactionHash = data.hash
    const transactionInput = config.data || '0x'
    const value = config.value
    const variables = {
      transactionHash: {
        value: transactionHash,
        type: 'String',
        valueInfo: {},
      },
      transactionInput: {
        value: transactionInput,
        type: 'String',
        valueInfo: {},
      },
      value: {
        value: value,
        type: 'String',
        valueInfo: {},
      },
    }
    completeTask(currentTask, variables).then((res) => {
      if (res === 204) {
        reset()
      }
    })
  }, [data?.hash])
  useEffect(() => {
    const getData = async () => {
      setProcesses(await getDefinitions())
      setInstances(await getInstances())
    }

    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      setCurrentInstance(null)
      setCurrentTask(null)
    }

    getData()
  }, [currentProcess])

  useEffect(() => {
    const getData = async () => {
      setTasks(await getTasks(null, currentProcess, currentInstance))
    }

    getData()
  }, [currentInstance, currentProcess])

  useEffect(() => {
    if (!currentTask) {
      return
    }

    const getData = async () => {
      const formVars = await getTaskVariables(currentTask)
      setFormVars(formVars)
      if (formVars.abi) {
        setAbi(JSON.parse(formVars.abi.value))
      }
    }

    getData()
  }, [currentTask])

  const task = tasks.find((task) => currentTask === task.id)

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
                    setCurrentProcess(process.id)
                    setCurrentInstance(null)
                  }}>
                  {process.name}
                </strong>

                <div className={styles.instances}>
                  <ul className={styles.instancesList}>
                    {instances
                      .filter((instance) => instance.definitionId === process.id)
                      ?.map((instance) => {
                        return (
                          <li
                            key={instance.id}
                            className={clsx(styles.instancesItem, {
                              active: currentInstance === instance.id,
                            })}
                            onClick={() => {
                              setCurrentProcess(process.id)
                              setCurrentInstance(instance.id)
                            }}>
                            {instance.id}
                          </li>
                        )
                      })}
                  </ul>
                </div>
              </li>
            )
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
                  setCurrentTask(task.id)
                }}>
                {task.name}
              </li>
            )
          })}
        </ul>
      </div>

      <div className={styles.props}>
        <h3 className={styles.propsTitle}>Task properties</h3>
        {!!task && (
          <table className={styles.propsTable}>
            <tbody className={styles.propsTBody}>
              {Object.entries(task).map(([key, value], idx) => {
                return (
                  <tr className={styles.propsTR} key={idx}>
                    <th className={styles.propsTH}>{key}</th>
                    <td className={styles.propsTD}>{value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.props}>
        <h3 className={styles.propsTitle}>Task form</h3>
        {!!formVars && abi && (
          <form
            onSubmit={handleSubmit(
              () => sendTransaction?.() || console.log('sendTransaction is not defined')
            )}>
            {abi.inputs.map((abiParam, idx) => {
              return (
                <>
                  <input
                    key={idx}
                    placeholder={abiParam.name || `param ${idx}`}
                    {...register(abiParam.name || `param ${idx}`, {
                      required: true,
                    })}
                  />
                  {formState.errors.exampleRequired && <span>This field is required</span>}
                </>
              )
            })}

            <Button
              caption={isLoading ? 'Sending...' : 'Send'}
              buttonType="submit"
              disabled={isLoading || !sendTransaction || !to || !value}
            />
          </form>
        )}
      </div>
    </div>
  )
}
