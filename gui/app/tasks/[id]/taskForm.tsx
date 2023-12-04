"use client";

import styles from "./page.module.scss";

import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AbiFunction } from "abitype";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Button from "@/src/components/Button";
import ConnectButton from "@/src/components/ConnectButton";

type TaskFormProps = {
  vars: unknown;
  abi: AbiFunction;
};

export const TaskForm: FC<TaskFormProps> = ({ vars, abi }) => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { register, handleSubmit, formState, watch, reset } = useForm();
  const to = watch("_to");
  const value = watch("_value");

  useEffect(() => {
    if (!address && openConnectModal) {
      openConnectModal();
    }
  }, [address]);

  const { config } = usePrepareSendTransaction({
    to: to,
    value: value,
    account: address,
  });

  const { data, sendTransaction } = useSendTransaction(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (!address) {
    return <ConnectButton className={styles.connect} />;
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(
        () =>
          sendTransaction?.() || console.log("sendTransaction is not defined")
      )}
    >
      {abi.inputs.map((abiParam, idx) => {
        return (
          <label key={idx} className={styles.formField}>
            <strong className={styles.formFieldTitle}>
              {abiParam.name || `param ${idx}`}
            </strong>
            <input
              className={styles.formFieldInput}
              {...register(abiParam.name || `param ${idx}`, {
                required: true,
              })}
            />
            {formState.errors.exampleRequired && (
              <span>This field is required</span>
            )}
          </label>
        );
      })}

      <Button
        caption={isLoading ? "Sending..." : "Send"}
        buttonType="submit"
        disabled={isLoading || !sendTransaction || !to || !value}
      />
    </form>
  );
};
